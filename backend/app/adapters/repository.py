from __future__ import annotations
import ydb
import ydb.iam
from app.config import YDB_DATABASE, YDB_ENDPOINT
from random import randint
from datetime import date
import app.domain.model as model


async def get_count_table(repository: Repository, name_table: str) -> int:
    return (await repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT COUNT(*) as count FROM {}; 
    """.format(YDB_DATABASE, name_table), {}))[0].rows[0].count


async def get_count_available_tickets(repository: Repository, slot_id: int) -> int:
    count_ticket = (await repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT SUM(amount) as sum FROM ticket
    WHERE slot_id = {};
    """.format(YDB_DATABASE, slot_id), {}))[0].rows[0].sum or 0
    amount_ticket = (await repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT amount FROM slots
    WHERE slot_id = {}""".format(YDB_DATABASE, slot_id), {}))[0].rows[0].amount
    return amount_ticket - count_ticket


async def generate_ticket_id(repository: Repository) -> int:
    tickets = set()
    session = await repository.pool.acquire()
    async for sets in await session.read_table(YDB_DATABASE + "/ticket"):
        for row in sets.rows:
            tickets.add(row.ticket_id)
    for _ in range(20):
        ticket_tmp = randint(int(1e8), int(1e9) - 1)
        if ticket_tmp not in tickets:
            return ticket_tmp
    await repository.pool.release(session)


async def is_available_slot(repository: Repository, slot_id: int) -> bool:
    return (await repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT slot_id FROM slots WHERE slot_id = {};
   """.format(YDB_DATABASE, slot_id), {}))[0].rows


async def is_children_event(repository: Repository, slot_id: int) -> bool:
    event = (await repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT is_children FROM event
        INNER JOIN slots
        ON event.event_id = slots.event_id
        where slot_id = {};""".format(YDB_DATABASE, slot_id), {}))[0].rows
    if event:
        return event[0].is_children
    return False


async def get_user(repository: Repository, phone: str, birthdate: date) -> model.User | None:
    user = (await repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT * FROM user
    WHERE birthdate = CAST("{}" AS Date) AND phone = "{}";
    """.format(YDB_DATABASE, birthdate.strftime("%Y-%m-%d"), phone), {}))[0].rows
    if user:
        return model.User(**user[0])


async def get_user_by_ticket(repository: Repository, ticket_id: int) -> model.User:
    user = (await repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT DISTINCT user.user_id AS user_id, first_name, last_name, phone, birthdate, email FROM ticket
        INNER JOIN user
        ON user.user_id = ticket.user_id
        WHERE ticket.ticket_id = {};
        """.format(YDB_DATABASE, ticket_id), {}))[0].rows
    if user:
        return model.User(**user[0])


async def get_tg_user(repository: Repository, telegram_id: int) -> model.TelegramUser | None:
    tg_user = (await repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT * FROM tg_user
        WHERE telegram_id = {};
    """.format(YDB_DATABASE, telegram_id), {}))[0].rows
    if tg_user:
        return model.TelegramUser(**tg_user[0])


# TODO save tg user


class Repository:
    def __init__(self):
        self.driver = ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                                     credentials=ydb.iam.ServiceAccountCredentials.from_file(
                                         'service-key.json'))
        self.pool = ydb.aio.SessionPool(self.driver, size=10)

    async def connect(self):
        await self.driver.wait(fail_fast=True)

    async def execute(self, query: str, data: dict):
        session = await self.pool.acquire()
        prepared_query = await session.prepare(query)
        result_transaction = await session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            data,
            commit_tx=True,
        )
        await self.pool.release(session)
        return result_transaction
