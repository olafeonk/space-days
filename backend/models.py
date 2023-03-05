from pydantic import BaseModel
from datetime import datetime, date


class Events(BaseModel):
    event_id: int
    description: str


class Slots(BaseModel):
    slot_id: int
    event_id: int
    start_time: datetime
    end_time: datetime


class Tickets(BaseModel):
    ticket_id: int
    user_id: str
    slot_id: str


class Child(BaseModel):
    child_id: int
    user_id: int
    first_name: str
    last_name: str
    age: int


class User(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    phone: str
    date_of_birth: date
    email: str


class TelegramUser(BaseModel):
    telegram_user_id: int
    type_user: str
    telegram_id: int
    username: str
    telegram_first_name: str
    telegram_last_name: str
