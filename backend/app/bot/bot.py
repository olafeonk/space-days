import logging

from aiogram import Bot, Dispatcher, types
from aiogram.contrib.middlewares.logging import LoggingMiddleware
from aiogram.utils.executor import start_webhook
from ..adapters.repository import get_tg_user, get_user_by_ticket, Repository, save_tg_user, get_count_table
from ..domain.model import TelegramUser
from enum import StrEnum
bot = Bot(token='5534458114:AAHAZlXu2xy9Z5x3YN-VqQxpCNm3up4iVUk')

logging.basicConfig(level=logging.INFO)
dp = Dispatcher(bot)
dp.middleware.setup(LoggingMiddleware())

WEBHOOK_URL = 'https://32bf-91-191-250-66.eu.ngrok.io'

WEBAPP_HOST = '127.0.0.1'
WEBAPP_PORT = 5050

repository: Repository


DEFAULT_MESSAGE = 'Привет я бот мероприятия дни космоса 😊'


class TypeUser(StrEnum):
    User = 'User'
    Visitor = 'Visitor'


async def on_startup(dp: Dispatcher):
    global repository
    repository = await Repository().connect()
    await bot.set_webhook(WEBHOOK_URL)


async def on_shutdown(dp: Dispatcher):
    logging.warning('Shutting down..')

    await bot.delete_webhook()
    await dp.storage.close()
    await dp.storage.wait_closed()

    logging.warning('Bye!')


@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    logging.info('starting')
    tg_user = await get_tg_user(repository, message.from_user.id)
    if not tg_user:
        ticket = message.get_args()
        if not ticket:
            await message.answer("Привет у нас тут скоро новое мероприятие если хочешь зарегайся")
            return
        user = await get_user_by_ticket(repository, int(ticket))
        if not user:
            logging.info(f"Ticket {ticket} not found")

            await message.answer("Привет у нас тут скоро новое мероприятие если хочешь зарегайся")
            return
        tg_user_id = await get_count_table(repository, 'tg_user')

        await save_tg_user(
            repository,
            TelegramUser(
                tg_user_id=tg_user_id,
                user_id=user.user_id,
                type_user=TypeUser.User,
                telegram_id=message.from_user.id,
                username=message.from_user.username,
                first_name=message.from_user.first_name,
                last_name=message.from_user.last_name
            )
        )
        await message.answer(ticket + message.from_user.username)

#
# @dp.message_handler(commands=['my-events'])
# async def my_events(message: types.Message):
#     tg_user = await get_tg_user(repository, message.from_user.id)
#     if not tg_user:
#
#

if __name__ == "__main__":
    start_webhook(
        dispatcher=dp,
        webhook_path="",
        on_startup=on_startup,
        on_shutdown=on_shutdown,
        skip_updates=True,
        host=WEBAPP_HOST,
        port=WEBAPP_PORT
    )
