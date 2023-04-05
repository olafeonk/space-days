import logging
import uuid

import requests

from .model import Mailing, MailingData
from .repository import Repository, get_data_mailing, save_mailing
from .config import API_TOKEN
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

py_formatter = logging.Formatter("%(name)s %(asctime)s %(levelname)s %(message)s")

stream_handler = logging.StreamHandler()
stream_handler.setFormatter(py_formatter)
logger.addHandler(stream_handler)


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


def send_email(
    repository: Repository,
    mailing: MailingData,
) -> int:
    """
        Notisend api
        https://notisend.ru/dev/email/api/#TOC_d7a6319e563f08691be55897faac38c2
    """
    headers = {'Authorization': f'Bearer {API_TOKEN}', 'Content-Type': 'application/json'}
    start_time = datetime(1970, 1, 1) + timedelta(seconds=int(mailing.start_time))
    data = {
        "to": mailing.email,
        "payment": "credit_priority",
        "params": {
            "first_name": mailing.first_name,
            "last_name": mailing.last_name,
            "ticket": make_beautiful_ticket(mailing.ticket_id),
            "event": mailing.title,
            "date": start_time.strftime("%d.%m.%Y"),
            "time": start_time.strftime("%H:%M"),
            "duration": f"{mailing.duration} {get_noun(int(mailing.duration), 'минута', 'минуты', 'минут')}",
            "address": mailing.location,
            "adult_count": mailing.adult_count,
            "child_count": mailing.child_count,
        }
    }
    logger.info(f"Send email to {mailing.email}, data {data}, headers {headers}")
    try:
        resp = requests.post('https://api.notisend.ru/v1/email/templates/782569/messages', headers=headers, json=data)
        logger.info(resp.json())
        save_mailing(repository,
                     Mailing(mailing_id=mailing.mailing_id, user_id=mailing.user_id, response=str(resp.json())),
                     mailing.ticket_id)
        resp.raise_for_status()
    except Exception:
        logger.error("Fail sending", exc_info=True)
    else:
        logger.info("Successful send")


def main():
    repository = Repository()
    repository.connect()
    mailings = get_data_mailing(repository)
    for mailing in mailings:
        send_email(repository, mailing)