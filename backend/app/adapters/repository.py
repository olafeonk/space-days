import ydb
import ydb.iam
from app.config import YDB_DATABASE, YDB_ENDPOINT
from random import randint
from datetime import date
import app.domain.model as model


async def get_count_table(name_table: str) -> int:
    driver = ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                            credentials=ydb.iam.ServiceAccountCredentials.from_file('service-key.json'))

    async with driver:
        await driver.wait()
        async with ydb.aio.SessionPool(driver, size=10) as pool:
            session: ydb.ISession = await pool.acquire()
            length = 0
            async for _ in await session.read_table(YDB_DATABASE + f'/{name_table}'):
                length += 1
            await pool.release(session)
    return length


async def get_count_available_tickets(slot_id: int) -> int:
    print(123)
    count_ticket = (await Repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT SUM(amount) as sum FROM ticket
    WHERE slot_id = {};
    """.format(YDB_DATABASE, slot_id), {}))[0].rows[0].sum or 0
    amount_ticket = (await Repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT amount FROM slots
    WHERE slot_id = {}""".format(YDB_DATABASE, slot_id), {}))[0].rows[0].amount
    return amount_ticket - count_ticket


async def generate_ticket_id() -> int:
    async with ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                              credentials=ydb.iam.ServiceAccountCredentials.from_file(
                                  'service-key.json')) as driver:
        await driver.wait(fail_fast=True)
        async with ydb.aio.SessionPool(driver, size=10) as pool:
            session = await pool.acquire()

            tickets = set()
            async for sets in await session.read_table(YDB_DATABASE + "/ticket"):
                for row in sets.rows:
                    tickets.add(row.ticket_id)
            for _ in range(20):
                ticket_tmp = randint(int(1e8), int(1e9) - 1)
                if ticket_tmp not in tickets:
                    return ticket_tmp
            await pool.release(session)


async def is_children_event(slot_id: int) -> bool:
    result = await Repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT is_children FROM event
        INNER JOIN slots
        ON event.event_id = slots.event_id
        where slot_id = {};""".format(YDB_DATABASE, slot_id), {})
    return result[0].rows[0].is_children


async def get_user(phone: str, birthdate: date) -> model.User | None:
    user = (await Repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT * FROM user
    WHERE birthdate = {} AND phone = "{}";
    """.format(YDB_DATABASE, birthdate.strftime("%Y-%m-%d"), phone), {}))[0].rows[0]
    if user.user_id is not None:
        return model.User(user_id=user.user_id,
                          first_name=user.first_name,
                          last_name=user.last_name,
                          phone=user.phone,
                          birthdate=user.birthdate,
                          email=user.email)


class Repository:
    @staticmethod
    async def execute(query: str, data: dict):
        print(query)
        print(YDB_DATABASE, YDB_ENDPOINT, ydb.iam.ServiceAccountCredentials.from_file('service-key.json'))
        async with ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                                  credentials=ydb.iam.ServiceAccountCredentials.from_file(
                                      'service-key.json')) as driver:
            await driver.wait()
            async with ydb.aio.SessionPool(driver, size=10) as pool:
                session = await pool.acquire()
                prepared_query = await session.prepare(query)
                result_transaction = await session.transaction(ydb.SerializableReadWrite()).execute(
                    prepared_query,
                    data,
                    commit_tx=True,
                )
                await pool.release(session)
        return result_transaction
