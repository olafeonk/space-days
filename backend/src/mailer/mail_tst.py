import requests

from .config import API_TOKEN


def send_email(
    email: str, ticket_no: str, image
):
    """
        Notisend api
        https://notisend.ru/dev/email/api/#TOC_d7a6319e563f08691be55897faac38c2
    """
    headers = {'Authorization': f'Bearer {API_TOKEN}', 'Content-Type': 'application/json'}
    data = {
        "to": email,
        "payment": "credit_priority",
        "params": {
            "ticket_no": ticket_no,
            "svg": image
        }
    }
    # тут мой шаблон
    resp = requests.post('https://api.notisend.ru/v1/email/templates/1277698/messages', headers=headers, json=data)
    if resp.status_code // 100 != 2:
        exit(0)