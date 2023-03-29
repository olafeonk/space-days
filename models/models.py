import asyncio

import ydb
import ydb.aio
import os





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
