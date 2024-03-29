from pydantic import BaseModel
from datetime import date, datetime


class Email(BaseModel):
    id: int
    email: str


class Event(BaseModel):
    event_id: int
    description: str
    summary: str
    title: str
    location: str
    age: str
    duration: str
    id_partner: str
    is_children: bool


class Slot(BaseModel):
    slot_id: int
    event_id: int
    start_time: str
    amount: int


class Ticket(BaseModel):
    ticket_id: int
    user_id: str
    slot_id: int
    amount: int
    user_data: str
    created_at: str


class Child(BaseModel):
    child_id: str
    user_id: str
    slot_id: int
    first_name: str
    age: int


class User(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    phone: str
    birthdate: date
    email: str


class UserToSave(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    phone: str
    birthdate_str: str
    email: str


class SendingLog(BaseModel):
    mailing_id: str
    user_id: str
    response: str
    created_at: str


class Mailing(BaseModel):
    mailing_id: str
    adult_count: int
    child_count: int
    ticket_id: int
    is_send: bool
    created_at: str | None
