import logging

import requests

from .model import SendingLog, MailingData
from .repository import Repository, get_data_mailing, save_mailing
from .config import API_TOKEN
from datetime import datetime, timedelta
import time
import io
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import qrcode

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

py_formatter = logging.Formatter("%(name)s %(asctime)s %(levelname)s %(message)s")

stream_handler = logging.StreamHandler()
stream_handler.setFormatter(py_formatter)
logger.addHandler(stream_handler)

bot_name = 'ColourBright2Bot'  # todo: имя продового бота чтобы катить на прод

def make_beautiful_ticket(ticket: int):
    ticket = str(ticket)
    return f"{ticket[:3]} {ticket[3: 6]} {ticket[6:]}"


def get_noun(number: int, one: str, two: str, five: str) -> str:
    n = abs(number)
    n %= 100
    if 5 <= n <= 20:
        return five
    n %= 10
    if n == 1:
        return one
    if 2 <= n <= 4:
        return two
    return five


def get_datetime_now() -> str:
    return (datetime.now() + timedelta(hours=5)).strftime("%Y-%m-%dT%H:%M:%SZ")


def generate_qr(ticket_id):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4, )
    qr.add_data(f'https://t.me/{bot_name}?start={ticket_id}')
    qr.make(fit=True)
    img = qr.make_image()
    return img


def generate_pdf(mailing: MailingData, buffer: io.BytesIO):
    start_time = datetime(1970, 1, 1) + timedelta(seconds=int(mailing.start_time))
    c = canvas.Canvas(buffer, pagesize='A4')
    c.setFont('DejaVuSans', 18)
    c.drawString(30, 750, 'Дни космоса')
    c.setFont('DejaVuSans', 12)
    c.drawString(30, 735, f'Билет на мероприятие {mailing.title}.')
    c.drawString(30, 720, f'Начало в {start_time.strftime("%H:%M")}, {start_time.strftime("%d.%m.%Y")}.')
    c.drawString(30, 705, 'На входе назовите номер билета или покажите qr-код.')
    c.setFont('DejaVuSans', 32)
    c.drawString(30, 680, f'Билет № {make_beautiful_ticket(mailing.ticket_id)}')
    image = generate_qr(mailing.ticket_id)
    with io.BytesIO() as output:
        image.save(output, format='PNG')
        output.seek(0)
        c.drawImage(ImageReader(output), 30, 560, 100, 100,)
    c.save()


def send_email(
    repository: Repository,
    mailing: MailingData,
    buffer: io.BytesIO,
):
    """
        Notisend api
        https://notisend.ru/dev/email/api/#TOC_d7a6319e563f08691be55897faac38c2
    """
    headers = {'Authorization': f'Bearer {API_TOKEN}'}
    start_time = datetime(1970, 1, 1) + timedelta(seconds=int(mailing.start_time))
    data = {
        "to": mailing.email,
        "payment": "credit_priority",
        "params[first_name]": mailing.first_name,
        "params[last_name]": mailing.last_name,
        "params[ticket]": make_beautiful_ticket(mailing.ticket_id),
        "params[event]": mailing.title,
        "params[date]": start_time.strftime("%d.%m.%Y"),
        "params[time]": start_time.strftime("%H:%M"),
        "params[duration]": f"{mailing.duration} {get_noun(int(mailing.duration), 'минута', 'минуты', 'минут')}",
        "params[address]": mailing.location,
        "params[adult_count]": mailing.adult_count,
        "params[child_count]": mailing.child_count,
    }
    logger.info(f"Send email to {mailing.email}, data {data}, headers {headers}")
    resp = requests.post('https://api.notisend.ru/v1/email/templates/782569/messages',
                         headers=headers,
                         data=data,
                         files={"attachments[]": ('space_days_ticket.pdf', buffer.getvalue())})
    logger.info(resp.json())
    if resp.status_code // 100 != 2:
        logger.critical(f"{resp.status_code} {resp.json()}")
        exit(0)
    save_mailing(repository,
                 SendingLog(mailing_id=mailing.mailing_id, user_id=mailing.user_id, response=str(resp.json()),
                            created_at=get_datetime_now()),
                 mailing.mailing_id)


def main():
    repository = Repository()
    repository.connect()
    mailings = get_data_mailing(repository)
    pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf'))
    for mailing in mailings:
        with io.BytesIO() as buffer:
            generate_pdf(mailing, buffer)
            send_email(repository, mailing, buffer)
        time.sleep(1)
