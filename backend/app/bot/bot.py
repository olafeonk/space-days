import logging

from aiogram import Bot, Dispatcher, types
from aiogram.contrib.middlewares.logging import LoggingMiddleware
from aiogram.utils.executor import start_webhook
from ..adapters.repository import get_tg_user, get_user_by_ticket

bot = Bot(token='5534458114:AAHAZlXu2xy9Z5x3YN-VqQxpCNm3up4iVUk')

logging.basicConfig(level=logging.INFO)
dp = Dispatcher(bot)
dp.middleware.setup(LoggingMiddleware())

WEBHOOK_URL = 'https://9e9b-91-191-250-66.eu.ngrok.io'

WEBAPP_HOST = '127.0.0.1'
WEBAPP_PORT = 5050


async def on_startup(dp: Dispatcher):

    await bot.set_webhook(WEBHOOK_URL)


async def on_shutdown(dp):
    logging.warning('Shutting down..')

    await bot.delete_webhook()
    await dp.storage.close()
    await dp.storage.wait_closed()

    logging.warning('Bye!')


@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    tg_user = await get_tg_user(message.from_user.id)
    if not tg_user:
        ticket = message.get_args()
        user = await get_user_by_ticket(int(ticket))
        if not user:
            logging.info(f"Ticket {ticket} not found")
            await message.answer("Привет у нас тут скоро новое мероприятие если хочешь зарегайся")


    await message.answer(ticket + message.from_user.username)


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
