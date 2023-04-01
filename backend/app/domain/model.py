from pydantic import BaseModel
from datetime import date

class Email(BaseModel):
    id: int
    email: str


class Event(BaseModel):
    event_id: int
    description: str
    summary: str
    title: str
    location: str
    age: str | None
    duration: str | None


class Slot(BaseModel):
    slot_id: int
    event_id: int
    start_time: str
    amount: int


class Ticket(BaseModel):
    ticket_id: int
    user_id: int
    slot_id: int
    amount: int
    user_data: str


class Child(BaseModel):
    child_id: int
    user_id: int
    slot_id: int
    first_name: str
    age: int


class User(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    phone: str
    birthdate: date
    email: str


class TelegramUser(BaseModel):
    tg_user_id: int
    user_id: int
    type_user: str
    telegram_id: int
    username: str
    first_name: str
    last_name: str | None
