import asyncio

import ydb
import ydb.aio
import os


queries = [
    """
    CREATE table `event` (
        `event_id` Uint64,
        `description` Utf8 NOT NULL,
        PRIMARY KEY (`event_id`)
    )
    """,
    """
    CREATE table `slots` (
        `slot_id` Uint64,
        `event_id` Uint64,
        `start_time` Datetime NOT NULL,
        `end_time` Datetime NOT NULL,
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
        `first_name` Utf8 NOT NULL,
        `last_name` Utf8 NOT NULL,
        `age` Uint8 NOT NULL,
        PRIMARY KEY (`child_id`, `user_id`)
    )
    """,
    """
    CREATE table `user` (
        `user_id` Uint64,
        `first_name` Utf8 NOT NULL,
        `last_name` Utf8 NOT NULL,
        `phone` Utf8,
        `date_of_birth` Date NOT NULL,
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
        'username' Utf8,
        `first_name` Utf8,
        `last_name` Utf8,
        PRIMARY KEY (`tg_user_id`, `user_id`),
    )
    """
]


async def create_table(session, query):
    """
    Helper function to acquire session, execute `create_table` and release it
    """
    await session.execute_scheme(query)


async def main():
    endpoint = os.getenv("YDB_ENDPOINT")
    database = os.getenv("YDB_DATABASE")
    async with ydb.aio.Driver(endpoint=endpoint, database=database) as driver:
        await driver.wait(fail_fast=True)

        async with ydb.aio.SessionPool(driver, size=10) as pool:
            coros = [
                pool.retry_operation(create_table, query) for query in queries
            ]

            await asyncio.gather(*coros)

            directory = await driver.scheme_client.list_directory(
                database
            )
            print("Items in database:")
            for child in directory.children:
                print(child.type, child.name)


if __name__ == "__main__":
    asyncio.run(main())
