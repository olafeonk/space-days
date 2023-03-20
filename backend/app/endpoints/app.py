from __future__ import annotations

import ydb
import ydb.iam
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn
from pydantic import BaseModel
from datetime import datetime, date
from app.config import YDB_DATABASE, YDB_ENDPOINT
from app.adapters.repository import get_count_table, generate_ticket_id
import app.domain.model as model

router = APIRouter()


class SlotRequest(BaseModel):
    start_time: datetime
    end_time: datetime
    amount: int


class ChildRequest(BaseModel):
    first_name: str
    last_name: str
    age: int


class UserRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    date_of_birth: date
    email: str
    child: list[ChildRequest] | None
    slot_id: int


class EventRequest(BaseModel):
    description: str
    slots: list[SlotRequest]


ADD_EVENT_QUERY = """PRAGMA TablePathPrefix("{}");

DECLARE $eventData AS List<Struct<
    event_id: Uint64,
    description: Utf8>>;

DECLARE $slotData AS List<Struct<
    slot_id: Uint64,
    event_id: Uint64,
    amount: Uint64,
    start_time: Utf8,
    end_time: Utf8>>;
    
INSERT INTO event
SELECT
    event_id,
    description
FROM AS_TABLE($eventData);

INSERT INTO slots
SELECT
    slot_id,
    event_id,
    amount,
    CAST(start_time AS Datetime) AS start_time,
    CAST(end_time AS Datetime) AS end_time
FROM AS_TABLE($slotData);
"""

GET_EVENT_QUERY = """PRAGMA TablePathPrefix("{}");
SELECT * FROM event
INNER JOIN slots
ON event.event_id = slots.event_id
ORDER BY event_id;
"""


ADD_USER_QUERY = """PRAGMA TablePathPrefix("{}");
DECLARE $userData AS List<Struct<
    user_id: Uint64,
    first_name: Utf8,
    last_name: Utf8,
    phone: Utf8,
    date_of_birth: Utf8,
    email: Utf8>>;

DECLARE $childData AS List<Struct<
    child_id: Uint64,
    user_id: Uint64,
    first_name: Utf8,
    last_name: Utf8,
    age: Uint8>>;

DECLARE $ticketData AS List<Struct<
    ticket_id: Uint64,
    slot_id: Uint64,
    user_id: Uint64>>;
    
INSERT INTO user
SELECT
    user_id,
    first_name,
    last_name,
    phone,
    CAST(date_of_birth AS Date) AS date_of_birth,
    email
FROM AS_TABLE($userData);

INSERT INTO child
SELECT
    child_id,
    user_id,
    first_name,
    last_name,
    age
FROM AS_TABLE($childData);

INSERT INTO ticket
SELECT
    ticket_id,
    user_id,
    slot_id
FROM AS_TABLE($ticketData);
"""


@router.get("/test")
async def test():
    return "Hello, world"


@router.get("/events")
async def get_events() -> list[EventRequest]:
    async with ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                              credentials=ydb.iam.ServiceAccountCredentials.from_file('service-key.json')) as driver:
        await driver.wait(fail_fast=True)
        async with ydb.aio.SessionPool(driver, size=10) as pool:

            session = await pool.acquire()
            prepared_query = await session.prepare(GET_EVENT_QUERY.format(YDB_DATABASE))
            result_sets = await session.transaction(ydb.SerializableReadWrite()).execute(
                prepared_query,
                commit_tx=True,
            )
            event_id = 0
            result = []
            event = EventRequest(description='',
                                 slots=[SlotRequest(start_time=datetime.now(), end_time=datetime.now(), amount=0)])
            for row in result_sets[0].rows:
                if event_id != row.event_id:
                    event_id = row.event_id
                    result.append(event)
                    event = EventRequest(description=row.description, slots=[])
                event.slots.append(SlotRequest(start_time=row.start_time, end_time=row.end_time, amount=row.amount))
            result.append(event)
            result.pop(0)

            await pool.release(session)
    return result


@router.post("/event")
async def add_event(event: EventRequest) -> None:
    driver = ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                            credentials=ydb.iam.ServiceAccountCredentials.from_file('service-key.json'))
    count = await get_count_table("event")
    count2 = await get_count_table("slots")
    async with driver:
        await driver.wait(fail_fast=True)
        async with ydb.aio.SessionPool(driver, size=10) as pool:
            session = await pool.acquire()
            prepared_query = await session.prepare(ADD_EVENT_QUERY.format(YDB_DATABASE))
            slots = []
            for i, slot in enumerate(event.slots):
                slots.append(model.Slot(slot_id=count2 + 1 + i,
                                        event_id=count + 1,
                                        start_time=slot.start_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
                                        end_time=slot.end_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
                                        amount=slot.amount
                                        ))
            await session.transaction(ydb.SerializableReadWrite()).execute(
                prepared_query,
                {
                    "$eventData": [model.Event(event_id=count + 1, description=event.description)],
                    "$slotData": slots,
                },
                commit_tx=True,
            )
            await pool.release(session)


@router.post('/user')
async def add_user(user: UserRequest):
    if len(user.child) > 3:
        return HTTPException(status_code=400, detail='too more child')
    driver = ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                            credentials=ydb.iam.ServiceAccountCredentials.from_file('service-key.json'))
    user_n = await get_count_table("user") + 1
    ticket_n = await get_count_table("ticket")
    child_n = await get_count_table("child")
    async with driver:
        async with ydb.aio.SessionPool(driver, size=10) as pool:
            session: ydb.ISession = await pool.acquire()
            prepared_query = await session.prepare(ADD_USER_QUERY.format(YDB_DATABASE))
            children = []
            for child in user.child:
                child_n += 1
                children.append(model.Child(
                    child_id=child_n,
                    user_id=user_n,
                    first_name=child.first_name,
                    last_name=child.last_name,
                    age=child.age,
                ))

            tickets = [model.Ticket(
                ticket_id=await generate_ticket_id(session),
                user_id=user_n,
                slot_id=user.slot_id
            ) for _ in range(len(user.child) + 1)]
            user = model.User(
                user_id=user_n,
                first_name=user.first_name,
                last_name=user.last_name,
                phone=user.phone,
                date_of_birth=user.date_of_birth.strftime('%Y-%m-%d'),
                email=user.email,
            )
            await session.transaction(ydb.SerializableReadWrite()).execute(
                prepared_query,
                {
                    "$userData": [user],
                    "$childData": children,
                    "$ticketData": tickets,
                },
                commit_tx=True,
            )
            await pool.release(session)
    return tickets


@router.get('/user')
async def get_user(request):
    raise NotImplementedError


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

    app.include_router(router)

    config = uvicorn.Config(app, host='0.0.0.0', port=8080)
    server = uvicorn.Server(config)
    await server.serve()
