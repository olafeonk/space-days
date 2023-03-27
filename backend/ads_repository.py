import asyncio
import ydb
import ydb.iam


queries = [
    """
    CREATE table `event` (
        `event_id` Uint64,
        `description` Utf8,
        `is_children` bool,
        `location` Utf8,
        `summary` Utf8,
        `title` Utf8,
        PRIMARY KEY (`event_id`)
    )
    """,
    """
    CREATE table `slots` (
        `slot_id` Uint64,
        `event_id` Uint64,
        `start_time` Datetime,
        `end_time` Datetime,
        `amount` Uint64,
        PRIMARY KEY (`slot_id`, `event_id`)
    )
    """,
    """
    CREATE table `ticket` (
        `ticket_id` Uint64,
        `user_id` Uint64,
        `slot_id` Uint64,
        PRIMARY KEY (`ticket_id`, `user_id`, `slot_id`)
    )
    """,
    """
    CREATE table `child` (
        `child_id` Uint64,
        `user_id` Uint64,
        `slot_id` Uint64,
        `first_name` Utf8,
        `last_name` Utf8,
        `age` Uint8,
        PRIMARY KEY (`child_id`, `user_id`)
    )
    """,
    """
    CREATE table `user` (
        `user_id` Uint64,
        `first_name` Utf8,
        `last_name` Utf8,
        `phone` Utf8,
        `birthdate` Date,
        `email` Utf8,
        PRIMARY KEY (`user_id`, `phone`, `email`)
    )
    """,
    """
    CREATE table `tg_user` (
        `tg_user_id` Uint64,
        `user_id` Uint64,
        `type_user` Utf8,
        `telegram_id` Uint64,
        `username` Utf8,
        `first_name` Utf8,
        `last_name` Utf8,
        PRIMARY KEY (`tg_user_id`, `user_id`)
    )
    """,
    """
    CREATE table `emails` (
        `id` Uint64,
        `email` Utf8,
        PRIMARY KEY (`id`)
    )
    """
]


async def _init_db(session: ydb.Session, query: str):
    try: 
        await session.execute_scheme(query)
    except ydb.issues.GenericError as e:
        print(query, e)

    else:
        print("created table, query: ", query)
    

class YDBClient:
    def __init__(self, endpoint: str, database: str):
        self._endpoint = endpoint
        self._database = database
        self._pool: ydb.aio.SessionPool | None = None
        self._driver: ydb.aio.Driver | None = None

    async def create_driver(self):
        print(self._endpoint)
        driver_config = ydb.DriverConfig(
            self._endpoint,
            self._database,
            credentials=ydb.iam.ServiceAccountCredentials.from_file('service-key.json'),
        )

        driver = ydb.aio.Driver(driver_config)
        try:
            await driver.wait(timeout=5)
        except Exception:
            raise ConnectionError(driver.discovery_debug_details())
        return driver
        
    async def connect(self):
        self._driver = await self.create_driver()

        self._pool = ydb.aio.SessionPool(self._driver, size=10)

        coros = [self._pool.retry_operation(_init_db, query) for query in queries]

        await asyncio.gather(*coros)

    async def close(self):
        await self._driver.stop(timeout=5)
