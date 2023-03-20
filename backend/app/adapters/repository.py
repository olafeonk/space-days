import abc

from ydb.aio.table import TxContext

from app.domain.model import Event
from datetime import datetime
import ydb
import ydb.iam
from app.config import YDB_DATABASE, YDB_ENDPOINT
from random import randint

async def get_count_table(name_table: str) -> int:
    driver = ydb.aio.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                            credentials=ydb.iam.ServiceAccountCredentials.from_file('service-key.json'))

    async with driver:
        async with ydb.aio.SessionPool(driver, size=10) as pool:
            session: ydb.ISession = await pool.acquire()
            length = 0
            async for _ in await session.read_table(YDB_DATABASE + f'/{name_table}'):
                length += 1
            pool.release(session)
    return length


async def generate_ticket_id(session: ydb.ISession) -> int:
    tickets = set()
    async for sets in await session.read_table(YDB_DATABASE + "/ticket"):
        for row in sets.rows:
            tickets.add(row.ticket_id)
    for _ in range(20):
        ticket_tmp = randint(int(1e8), int(1e9) - 1)
        if ticket_tmp not in tickets:
            return ticket_tmp


class AbstractRepository(abc.ABC):
    @abc.abstractmethod
    async def add(self, *args, **kwargs):
        raise NotImplementedError

    @abc.abstractmethod
    async def get(self, *args, **kwargs):
        raise NotImplementedError


'''
PRAGMA TablePathPrefix("{}");
REPLACE INTO event (event_id, descrpition)
VALUES ()
'''

class EventRepository(AbstractRepository):
    def __init__(self, context: TxContext):
        self.context = context

    async def add(self, description) -> None:
        self.context.add(description)

    async def get(self, sku) -> Event:
        raise NotImplementedError

    async def list(self) -> list[Event]:
        raise NotImplementedError


class SlotRepository(AbstractRepository):
    def __init__(self, context: TxContext):
        self.context = context

    async def add(self, start_time: datetime, end_time: datetime, amount: int) -> None:
        self.context.add(start_time, end_time, amount)

    async def get(self, sku) -> Event:
        raise NotImplementedError

    async def list(self) -> list[Event]:
        raise NotImplementedError
