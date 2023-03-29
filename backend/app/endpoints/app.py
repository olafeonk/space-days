from __future__ import annotations

from fastapi import FastAPI, APIRouter, HTTPException, Query, Response, status, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from ..config import YDB_DATABASE
from ..adapters.repository import (
    get_count_table,
    generate_ticket_id,
    Repository,
    get_count_available_tickets,
    is_children_event, get_user,
    is_available_slot
)
import app.domain.model as model

router = APIRouter()


class SlotRequest(BaseModel):
    slot_id: int
    start_time: datetime
    amount: int
    available_users: int | None


class ChildRequest(BaseModel):
    first_name: str
    last_name: str
    age: int


class UserRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    birthdate: date
    email: EmailStr
    child: list[ChildRequest] | None
    slot_id: int


class EventRequest(BaseModel):
    event_id: int
    description: str
    location: str
    summary: str
    title: str
    age: str | None
    duration: str | None
    slots: list[SlotRequest]


class EmailRequest(BaseModel):
    email: EmailStr


class TicketRequest(BaseModel):
    phone: str
    birthdate: date


class UserEventsRequest(BaseModel):
    event_id: int
    slot_id: int
    user_id: int
    title: str
    location: str
    summary: str
    age: str | None
    duration: str | None
    description: str
    start_time: datetime


ADD_EVENT_QUERY = """PRAGMA TablePathPrefix("{}");

DECLARE $eventData AS List<Struct<
    event_id: Uint64,
    description: Utf8,
    is_children: bool,
    location: Utf8,
    summary: str,
    title: str>>;

DECLARE $slotData AS List<Struct<
    slot_id: Uint64,
    event_id: Uint64,
    amount: Uint64,
    start_time: Utf8>>;
    
INSERT INTO event
SELECT
    event_id,
    description,
    is_children,
    location,
    summary,
    title
FROM AS_TABLE($eventData);

INSERT INTO slots
SELECT
    slot_id,
    event_id,
    amount,
    CAST(start_time AS Datetime) AS start_time
FROM AS_TABLE($slotData);
"""


ADD_USER_QUERY = """PRAGMA TablePathPrefix("{}");
DECLARE $userData AS List<Struct<
    user_id: Uint64,
    first_name: Utf8,
    last_name: Utf8,
    phone: Utf8,
    birthdate: Utf8,
    email: Utf8>>;

DECLARE $childData AS List<Struct<
    child_id: Uint64,
    user_id: Uint64,
    slot_id: Uint64,
    first_name: Utf8,
    last_name: Utf8,
    age: Uint8>>;

DECLARE $ticketData AS List<Struct<
    ticket_id: Uint64,
    slot_id: Uint64,
    user_id: Uint64,
    amount: Uint64>>;
    
INSERT INTO user
SELECT
    user_id,
    first_name,
    last_name,
    phone,
    CAST(birthdate AS Date) AS birthdate,
    email
FROM AS_TABLE($userData);

INSERT INTO child
SELECT
    child_id,
    user_id,
    slot_id,
    first_name,
    last_name,
    age
FROM AS_TABLE($childData);

INSERT INTO ticket
SELECT
    ticket_id,
    user_id,
    slot_id,
    amount
FROM AS_TABLE($ticketData);
"""

GET_USER_EVENTS = """PRAGMA TablePathPrefix("{}");
SELECT slots.event_id AS event_id, slots.slot_id AS slot_id, title, location, age, duration, summary, description, start_time, user_id FROM slots
INNER JOIN ticket
ON ticket.slot_id = slots.slot_id
INNER JOIN event
ON event.event_id = slots.event_id
WHERE user_id = {}
"""


@router.get("/api/test")
async def test():
    return "Hello, world"


@router.post("/api/emails/subscribe", status_code=status.HTTP_201_CREATED)
async def add_email(request: Request, email: EmailRequest, response: Response):
    repository: Repository = request.app.repository
    email_id = await get_count_table(repository, 'emails')
    emails = (await repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT * FROM emails
        WHERE email = '{}';
    """.format(YDB_DATABASE, email.email), {}))[0].rows
    if emails:
        response.status_code = status.HTTP_200_OK
        return
    await repository.execute(
        """PRAGMA TablePathPrefix("{}");
        DECLARE $emailData AS List<Struct<
            id: Uint64,
            email: Utf8>>;
        
        INSERT INTO emails
        SELECT
            id,
            email
        FROM AS_TABLE($emailData);
        """.format(YDB_DATABASE),
        {
            "$emailData": [model.Email(id=email_id, email=email.email)]
        }
    )


@router.get("/api/events/", response_model=list[EventRequest])
async def get_events(request: Request, id: int | None = None, days: list[int] | None = Query(None), hours: list[int] | None = Query(None)):
    repository: Repository = request.app.repository
    query = """PRAGMA TablePathPrefix("{}");
    SELECT * FROM event
    INNER JOIN slots
    ON event.event_id = slots.event_id\n""".format(YDB_DATABASE)
    if id is not None or days or hours:
        query += " WHERE "
    if id is not None:
        query += "\tevent.event_id = {}\n".format(id)
    if days:
        if id is not None:
            query += " AND "
        query += "DateTime::GetDayOfMonth(slots.start_time) IN {}\n".format(days)
    if hours:
        if id is not None or days:
            query += " AND "
        query += "DateTime::GetHour(slots.start_time) IN {}\n".format(hours)
    query += "\tORDER BY event_id;"
    result_sets = await repository.execute(query, {})
    event_id = 0
    result = []
    event = EventRequest(
        event_id=0,
        description='',
        location='',
        summary='',
        title='',
        slots=[SlotRequest(slot_id=0, start_time=datetime.now(), amount=0)])
    for row in result_sets[0].rows:
        if event_id != row.event_id:
            event_id = row.event_id
            result.append(event)
            event = EventRequest(slots=[], **row)
        event.slots.append(SlotRequest(available_users=(await get_count_available_tickets(repository, row.slot_id)),
                                       **row))

    result.append(event)
    result.pop(0)

    return result


# @router.post("/api/event")
# async def add_event(event: EventRequest) -> None:
#     driver = ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
#                             credentials=ydb.iam.ServiceAccountCredentials.from_file('service-key.json'))
#     count = await get_count_table("event")
#     count2 = await get_count_table("slots")
#     async with driver:
#         await driver.wait(fail_fast=True)
#         async with ydb.aio.SessionPool(driver, size=10) as pool:
#             session = await pool.acquire()
#             prepared_query = await session.prepare(ADD_EVENT_QUERY.format(YDB_DATABASE))
#             slots = []
#             for i, slot in enumerate(event.slots):
#                 slots.append(model.Slot(slot_id=count2 + 1 + i,
#                                         event_id=count + 1,
#                                         start_time=slot.start_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
#                                         end_time=slot.end_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
#                                         amount=slot.amount
#                                         ))
#             await session.transaction(ydb.SerializableReadWrite()).execute(
#                 prepared_query,
#                 {
#                     "$eventData": [model.Event(event_id=count + 1, description=event.description)],
#                     "$slotData": slots,
#                 },
#                 commit_tx=True,
#             )
#             await pool.release(session)


@router.post('/api/events/subscribe')
async def add_user(request: Request, user: UserRequest, response: Response):
    repository: Repository = request.app.repository
    if len(user.child) > 3:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='too more child')
    if not await is_available_slot(repository, slot_id=user.slot_id):
        response.status_code = status.HTTP_400_BAD_REQUEST
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='slot not available')
    old_user = await get_user(repository, user.phone, user.birthdate)
    is_child_event = await is_children_event(repository, user.slot_id)
    available_tickets = await get_count_available_tickets(repository, user.slot_id)
    booked_tickets = len(user.child) + (not is_child_event)
    if available_tickets < booked_tickets:
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f'available ticket {available_tickets} '
                                                                          f'< booked ticket {booked_tickets}')

    user_n = await get_count_table(repository, "user") + 1
    if old_user:
        user_n = old_user.user_id
    child_n = await get_count_table(repository, "child")
    children = []
    for child in user.child:
        child_n += 1
        children.append(model.Child(
            child_id=child_n,
            user_id=user_n,
            slot_id=user.slot_id,
            first_name=child.first_name,
            last_name=child.last_name,
            age=child.age,
        ))
    ticket = model.Ticket(
        ticket_id=await generate_ticket_id(repository),
        user_id=user_n,
        slot_id=user.slot_id,
        amount=booked_tickets,
    )
    if not old_user:
        user = model.User(
            user_id=user_n,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            birthdate=user.birthdate.strftime('%Y-%m-%d'),
            email=user.email,
        )
    await repository.execute(ADD_USER_QUERY.format(YDB_DATABASE),
                             {
                                 "$childData": children,
                                 "$userData": [user],
                                 "$ticketData": [ticket],
                             })
    return ticket


@router.post('/api/tickets/my')
async def get_user_events(request: Request, body: TicketRequest):
    repository: Repository = request.app.repository
    user = await get_user(repository, body.phone, body.birthdate)
    if not user:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no user")
    result = []

    for row in (await repository.execute(GET_USER_EVENTS.format(YDB_DATABASE, user.user_id), {}))[0].rows:
        print(f"result: {row}")
        result.append(UserEventsRequest(**row))
    return result


async def main():
    load_dotenv()

    print('Starting app...')
    app = FastAPI()
    origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    repository = Repository()
    await repository.connect()
    app.repository = repository

    app.include_router(router)

    config = uvicorn.Config(app, host='0.0.0.0', port=8080)
    server = uvicorn.Server(config)
    await server.serve()
