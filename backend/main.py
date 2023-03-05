from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from ads_repository import YDBClient
from dotenv import load_dotenv
import os
import uvicorn
import asyncio


router = APIRouter()


@router.get("/test")
async def test():
    return "Hello, world"

# @router.get("/ads")
# def ads(request: Request) -> List[Ad]:
#     repository: AdsRepository = request.app.ads_repository

#     return repository.get_ads()


# @router.post("/ads")
# async def add_ad(request: Request, ad: AddAd):
#     repository: AdsRepository = request.app.ads_repository
#     return repository.insert_ad(**ad.dict())


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
    ads_repository = YDBClient(endpoint=os.getenv("ENDPOINT"), database=os.getenv("DB"))

    await ads_repository.connect()
    app.ads_repository = ads_repository

    app.include_router(router)

    config = uvicorn.Config(app, host='0.0.0.0', port=8080)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == '__main__':
    asyncio.run(main())
