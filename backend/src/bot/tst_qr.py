import os
import telebot
import cv2
import requests as rq
from urllib.request import urlopen
import numpy as np
import re
import qrcode
import qrcode.image.svg
import traceback

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

py_formatter = logging.Formatter("%(name)s %(asctime)s %(levelname)s %(message)s")

stream_handler = logging.StreamHandler()
stream_handler.setFormatter(py_formatter)
logger.addHandler(stream_handler)


bot = telebot.TeleBot(os.getenv('BOT_TOKEN'))


# --------------------- bot ---------------------
@bot.message_handler(commands=['start'])
def handle_start(message):
    if len(message.text.split()) > 1:
        get_ticket(message)
        return

    bot.send_message(message.chat.id,
                     'Привет!',
                     parse_mode='markdown')


@bot.message_handler(commands=['help'])
def get_help(message):
    bot.send_message(message.chat.id,
                     'Ты просишь помощи',
                     parse_mode='markdown')


def read_qr_code(url):
    try:
        req = urlopen(url)
        arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
        img = cv2.imdecode(arr, -1)
        detect = cv2.QRCodeDetector()
        value, points, straight_qrcode = detect.detectAndDecode(img)
        return value
    except Exception:
        return ''


RE_TICKET_NO = rf'https://t\.me/{bot.get_me().username}\?start=(\S*)'


@bot.message_handler(content_types=['photo'])
def photo(message):
    bot.send_message(message.chat.id, "Читаю QR-код с фото...")
    fileID = message.photo[-1].file_id
    file_info = bot.get_file(fileID)
    file_path = f'https://api.telegram.org/file/bot{os.getenv("BOT_TOKEN")}/{file_info.file_path}'
    info = read_qr_code(file_path)
    if info is None or len(info) == 0:
        bot.send_message(message.chat.id, "Не удалось прочитать QR-код")
        return
    ticket_no = re.findall(RE_TICKET_NO, info)
    if len(ticket_no) == 0:
        bot.send_message(message.chat.id, f"Не удалось прочитать номер билета. Вот что здесь написано: {info}")
        return
    handle_ticket(message.chat.id, ticket_no[0])


def handle_ticket(chat_id, text):
    if text.isdigit():
        ticket_id = text
        bot.send_message(chat_id, f"Билет номер {ticket_id}")
    else:
        bot.send_message(chat_id, "Введите в формате /ticket 123456789")


@bot.message_handler(commands=['ticket'])
def get_ticket(message):
    bot.send_message(message.chat.id, f"Хочешь отметить билет!")
    words = message.text.split()
    if len(words) == 2 and words[1].isdigit():
        bot.send_message(message.chat.id, "Билет номер...")
        bot.send_message(message.chat.id, words[1])
    else:
        bot.send_message(message.chat.id, "Введите номер билета в формате /ticket 123456789")


# ---------------------mailer testing stuff


@bot.message_handler(commands=['send'])
def send_message_to_email(message: telebot.types.Message):
    if len(message.text.split()) < 3 or not message.text.split()[1].__contains__('@'):
        bot.send_message(message.chat.id, "Введите получателя и сообщение в формате /send example@mail.ru 123456789")
    text_to_send = str.join('', message.text.split()[2:])
    bot.send_message(message.chat.id, f'Текст: {text_to_send}')
    svg = str(make_qr(text_to_send))
    bot.send_message(message.chat.id, f'Код: {svg}')
    try:
        send_email(message.text.split()[1], text_to_send, svg)
        bot.send_message(message.chat.id, "Отправлено, лови!")
    except:
        bot.send_message(message.chat.id, traceback.format_exc())


def make_qr(text):
    qr = qrcode.QRCode(image_factory=qrcode.image.svg.SvgPathImage)
    qr.add_data(text)
    qr.make(fit=True)

    img = qr.make_image()
    return img.to_string()


def send_email(
    email: str, ticket_no: str, image: str
):
    """
        Notisend api
        https://notisend.ru/dev/email/api/#TOC_d7a6319e563f08691be55897faac38c2
    """
    headers = {'Authorization': f'Bearer {os.getenv("API_TOKEN")}', 'Content-Type': 'application/json'}
    data = {
        "from_email": 'katerinka_post@mail.ru',
        "subject": "Поговорим о необходимости тестирования",
        "to": email,
        "payment": "credit_priority",
        "params": {
            "ticket_no": ticket_no,
            "svg": 'heh' #image
        }
    }
    # тут мой шаблон
    logger.info(f"Send email to {email}, data {data}, headers {headers}")
    resp = rq.post('https://api.notisend.ru/v1/email/templates/1277698/messages', headers=headers, json=data)
    logger.info(resp.json())
    if resp.status_code // 100 != 2:
        logger.critical(f"{resp.status_code} {resp.json()}")


if __name__ == '__main__':
    bot.infinity_polling()
