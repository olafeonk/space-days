from __future__ import annotations

import logging
import uuid

from fastapi import FastAPI, APIRouter, HTTPException, Query, Response, status, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
from pydantic import BaseModel, EmailStr
from datetime import datetime, date, time, timedelta
from ..config import YDB_DATABASE, API_TOKEN
from ..adapters.repository import (
    get_count_table,
    generate_ticket_id,
    Repository,
    get_count_available_ticket_by_slot,
    is_children_event, get_user,
    is_available_slot,
    is_user_already_registration,
    save_new_mailing,
    save_events,
)
from ..core import dateFromYdbDate, strFromDate, dateFromStr
import app.domain.model as model
import aiohttp

from pythonjsonlogger import jsonlogger


class YcLoggingFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record['logger'] = record.name
        log_record['level'] = str.replace(str.replace(record.levelname, "WARNING", "WARN"), "CRITICAL", "FATAL")


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

stream_handler = logging.StreamHandler()
stream_handler.setFormatter(YcLoggingFormatter('%(message)s %(level)s %(logger)s'))
logger.addHandler(stream_handler)

router = APIRouter()


class SlotRequest(BaseModel):
    slot_id: int
    start_time: datetime
    amount: int
    available_users: int | None


class ChildRequest(BaseModel):
    first_name: str
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
    id_partner: str
    slots: list[SlotRequest]


class EmailRequest(BaseModel):
    email: EmailStr


class TicketRequest(BaseModel):
    phone: str
    birthdate: date


class TicketResponse(BaseModel):
    ticket_id: int
    user_id: str
    slot_id: int
    amount: int
    user_data: str
    child: int


class UserEventsResponse(BaseModel):
    ticket_id: int
    amount: int
    user_id: str
    slot_id: int
    start_time: datetime
    event_id: int
    title: str
    location: str
    age: str | None
    duration: str | None
    child: int


class SlotJson(BaseModel):
    start_time: str
    amount: int


class EventJson(BaseModel):
    description: str
    location: str
    summary: str
    title: str
    age: str
    duration: str
    id_partner: str
    is_children: bool
    slots: list[SlotJson]


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
    user_id: Utf8,
    first_name: Utf8,
    last_name: Utf8,
    phone: Utf8,
    birthdate_str: Utf8,
    email: Utf8>>;

DECLARE $childData AS List<Struct<
    child_id: Utf8,
    user_id: Utf8,
    slot_id: Uint64,
    first_name: Utf8,
    age: Uint64>>;

DECLARE $ticketData AS List<Struct<
    ticket_id: Uint64,
    slot_id: Uint64,
    user_id: Utf8,
    amount: Int64,
    user_data: Utf8,
    created_at: Utf8>>;
    
UPSERT INTO user
SELECT
    user_id,
    first_name,
    last_name,
    phone,
    birthdate_str,
    email
FROM AS_TABLE($userData);

INSERT INTO child
SELECT
    child_id,
    user_id,
    slot_id,
    first_name,
    age
FROM AS_TABLE($childData);

INSERT INTO ticket
SELECT
    ticket_id,
    user_id,
    slot_id,
    amount,
    user_data,
    CAST(created_at AS Datetime) AS created_at
FROM AS_TABLE($ticketData);
"""

GET_USER_EVENTS = """PRAGMA TablePathPrefix("{}");
SELECT
ticket_id,
SOME(ticket_x.amount) AS amount,
SOME(ticket_x.user_id) AS user_id,

SOME(slots.slot_id) AS slot_id,
SOME(start_time) AS start_time,

SOME(event.event_id) AS event_id,
SOME(title) AS title,
SOME(location) AS location,
SOME(event.age) AS age,
SOME(duration) AS duration,

COUNT(child_id) AS child


FROM ticket VIEW user_slot_index AS ticket_x
INNER JOIN slots ON slots.slot_id = ticket_x.slot_id
INNER JOIN event ON event.event_id = slots.event_id
LEFT JOIN child VIEW user_slot_index AS child_x ON child_x.slot_id = ticket_x.slot_id AND child_x.user_id = ticket_x.user_id

WHERE ticket_x.user_id = "{}"

GROUP BY ticket_x.ticket_id AS ticket_id
ORDER BY start_time
"""


def get_datetime_now() -> str:
    return (datetime.now() + timedelta(hours=5)).strftime("%Y-%m-%dT%H:%M:%SZ")


@router.get("/api/test")
def test():
    return "Hello, world"


@router.post("/api/emails/subscribe", status_code=status.HTTP_201_CREATED)
def add_email(request: Request, email: EmailRequest, response: Response):
    repository: Repository = request.app.repository
    email_id = get_count_table(repository, 'emails')
    emails = (repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT * FROM emails
        WHERE email = '{}';
    """.format(YDB_DATABASE, email.email), {}))[0].rows
    if emails:
        response.status_code = status.HTTP_200_OK
        return
    repository.execute(
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
def get_events(request: Request, id: int | None = None, days: list[int] | None = Query(None),
               hours: list[int] | None = Query(None)):
    logger.info(f"Get events, id: {id}, days: {days}, hours: {hours}")
    repository: Repository = request.app.repository

    slotsView = "slots"
    ticketView = "ticket"
    if days or hours:
        slotsView = "slots VIEW start_time_index AS slots"
        ticketView = "ticket VIEW slot_id_index AS ticket"
    if id is not None:
        slotsView = "slots VIEW event_id_index AS slots"
        ticketView = "ticket VIEW slot_id_index AS ticket"

    query = """PRAGMA TablePathPrefix("{}");
    SELECT
        slots.slot_id AS slot_id,
        SOME(slots.start_time) AS start_time,
        SOME(slots.amount) AS amount,
        CAST(SOME(slots.amount) AS Int64) - COALESCE(SUM(ticket.amount), 0) AS available_ticket,
        SOME(event.event_id) AS event_id,
        SOME(event.age) AS age,
        SOME(event.description) AS description, 
        SOME(event.duration) AS duration,
        SOME(event.id_partner) AS id_partner,
        SOME(event.is_children) AS is_children,
        SOME(event.location) AS location,
        SOME(event.summary) AS summary,
        SOME(event.title) AS title
    FROM {} LEFT JOIN {} ON slots.slot_id = ticket.slot_id
    INNER JOIN event ON event.event_id = slots.event_id\n""".format(YDB_DATABASE, slotsView, ticketView)

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
    query += "\tGROUP BY slots.slot_id ORDER BY event_id, start_time;"

    result_sets = repository.execute(query, {})

    event_id = 0
    result = []
    event = EventRequest(
        event_id=0,
        description='',
        location='',
        summary='',
        title='',
        id_partner='',
        slots=[SlotRequest(slot_id=0, start_time=datetime.now(), amount=0)])
    for row in result_sets[0].rows:
        if event_id != row.event_id:
            event_id = row.event_id
            result.append(event)
            event = EventRequest(slots=[], **row)
        event.slots.append(SlotRequest(
            slot_id=row.slot_id,
            amount=row.amount,
            start_time=row.start_time,
            available_users=row.available_ticket))

    result.append(event)
    result.pop(0)
    result.sort(key=lambda x: x.slots[0].start_time)
    logger.info(f"Get events success\nresult: {result}")
    return result  # TODO: return is_available_child


def refactor_phone(phone: str) -> str:
    correct_phone = ''
    for char in phone:
        if char.isdigit():
            correct_phone += char
    if len(correct_phone) == 10:
        return correct_phone
    if len(correct_phone) == 11 and correct_phone[0] in '78':
        return correct_phone[1:]
    raise TypeError


@router.post('/api/events/subscribe')
def add_user(request: Request, userRequest: UserRequest, response: Response, force_registration: bool = False):
    logging.info(f"Add registration, user: {userRequest}, force_registration: {force_registration}")
    repository: Repository = request.app.repository
    user_response = userRequest.__repr__()
    childs = userRequest.child or []
    try:
        phone = refactor_phone(userRequest.phone)
    except TypeError:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        logger.warning(f"Invalid phone: {userRequest.phone}", exc_info=True)
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='invalid phone')
    if len(childs) > 3:
        response.status_code = status.HTTP_400_BAD_REQUEST
        logger.warning(f"Count child: {len(childs)} > 3")
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                             detail='too more child',
                             headers={'reason': 'too more child'})
    if not is_available_slot(repository, slot_id=userRequest.slot_id):
        response.status_code = status.HTTP_400_BAD_REQUEST
        logger.warning(f"Slot not exists {userRequest.slot_id}")
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                             detail='slot not available',
                             headers={'reason': 'slot not available'})
    old_user = get_user(repository, phone)
    logger.info(old_user)
    if old_user and is_user_already_registration(repository, userRequest.slot_id, old_user.user_id):
        if not force_registration:
            response.status_code = status.HTTP_409_CONFLICT
            logger.warning(f"User {old_user.user_id} already registered on slot {userRequest.slot_id}")
            return HTTPException(status_code=status.HTTP_409_CONFLICT, detail='user already registered',
                                 headers={'reason': 'already_registered'})
    is_child_event = is_children_event(repository, userRequest.slot_id)
    booked_tickets = max(len(childs) + (not is_child_event), 1)
    slot_id = userRequest.slot_id

    user_n = str(uuid.uuid4())
    if old_user:
        user_n = old_user.user_id
    children = []
    for child in childs:
        children.append(model.Child(
            child_id=str(uuid.uuid4()),
            user_id=user_n,
            slot_id=userRequest.slot_id,
            first_name=child.first_name,
            age=child.age,
        ))
    ticket = model.Ticket(
        ticket_id=generate_ticket_id(repository),
        user_id=user_n,
        slot_id=userRequest.slot_id,
        amount=booked_tickets,
        user_data=user_response,
        created_at=get_datetime_now(),
    )
    user = model.UserToSave(
        user_id=user_n,
        first_name=userRequest.first_name,
        last_name=userRequest.last_name,
        phone=phone,
        birthdate_str=strFromDate(userRequest.birthdate),
        email=userRequest.email,
    )

    available_ticket = get_count_available_ticket_by_slot(repository, slot_id)
    if available_ticket < booked_tickets:
        logger.warning(f'available ticket {available_ticket} < booked ticket {booked_tickets}')
        response.status_code = status.HTTP_409_CONFLICT
        return HTTPException(status_code=status.HTTP_409_CONFLICT,
                             detail=f'available ticket {available_ticket} '
                                    f'< booked ticket {booked_tickets}',
                             headers={'reason': 'no_tickets', 'amount': available_ticket})

    logger.info(f"children: {children}, user: {user}, ticket: {ticket}")

    # TODO Дополнительная проверка доступности места должна быть частью транзакции по подписке
    repository.execute(ADD_USER_QUERY.format(YDB_DATABASE),
                       {
                           "$childData": children,
                           "$userData": [user],
                           "$ticketData": [ticket],
                       })
    logger.info("Success subscription")

    save_new_mailing(repository, model.Mailing(
        mailing_id=str(uuid.uuid4()),
        child_count=len(childs),
        adult_count=ticket.amount - len(childs),
        ticket_id=ticket.ticket_id,
        is_send=False,
        created_at=get_datetime_now(),
    ))
    logger.info("Success mailing")

    return TicketResponse(
        ticket_id=ticket.ticket_id,
        user_id=ticket.user_id,
        slot_id=ticket.slot_id,
        amount=ticket.amount,
        user_data=ticket.user_data,
        child=len(childs),
    )


@router.post('/api/event')
def save_event(request: Request, body: EventJson):
    print("run")
    repository: Repository = request.app.repository
    count_event = get_count_table(repository, "event") + 2
    count_slots = get_count_table(repository, "slots")
    print(count_event, count_slots)
    event = model.Event(event_id=count_event, **body.dict())
    slots = []
    for slot_id, slot in enumerate(body.slots):
        slots.append(model.Slot(slot_id=count_slots + slot_id, event_id=count_event, **slot.dict()))
    save_events(repository, [event], slots)


@router.post('/api/tickets/my')
def get_user_events(request: Request, response: Response, body: TicketRequest):
    repository: Repository = request.app.repository
    try:
        phone = refactor_phone(body.phone)
    except TypeError:
        response.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
        logger.warning(f"Invalid phone at my tickets: {body.phone}", exc_info=True)
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='invalid phone')

    user = get_user(repository, phone)
    if not user:
        response.status_code = status.HTTP_404_NOT_FOUND
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    if user.birthdate != body.birthdate:
        response.status_code = status.HTTP_404_NOT_FOUND
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")

    result = []

    for row in (repository.execute(GET_USER_EVENTS.format(YDB_DATABASE, user.user_id), {}))[0].rows:
        logger.info(f"result: {row}")
        result.append(UserEventsResponse(**row))
    return result


def main():
    load_dotenv()

    logger.info('Starting app...')
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
    repository.connect()
    app.repository = repository

    app.include_router(router)

    config = uvicorn.Config(app, host='0.0.0.0', port=8080)
    server = uvicorn.Server(config)
    server.run()
