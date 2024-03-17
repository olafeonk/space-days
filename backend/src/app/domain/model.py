from pydantic import BaseModel, EmailStr
from datetime import datetime, date


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
    created_at: str | None = None


class SlotRequest(BaseModel):
    slot_id: int
    start_time: datetime
    amount: int
    available_users: int | None = None


class ChildRequest(BaseModel):
    first_name: str
    age: int


class UserRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    birthdate: date
    email: EmailStr
    child: list[ChildRequest] | None = None
    slot_id: int


class EventRequest(BaseModel):
    event_id: int
    description: str
    location: str
    summary: str
    title: str
    age: str | None = None
    duration: str | None = None
    id_partner: str
    slots: list[SlotRequest]


class EmailRequest(BaseModel):
    email: EmailStr


class TicketRequest(BaseModel):
    phone: str
    birthdate: date


class TicketResponse(BaseModel):
    ticket_id: int
    user_id: str
    slot_id: int
    amount: int
    user_data: str
    child: int


class UserEventsResponse(BaseModel):
    ticket_id: int
    amount: int
    user_id: str
    slot_id: int
    start_time: datetime
    event_id: int
    title: str
    location: str
    age: str | None = None
    duration: str | None = None
    child: int


class SlotJson(BaseModel):
    start_time: str
    amount: int


class EventJson(BaseModel):
    description: str
    location: str
    summary: str
    title: str
    age: str
    duration: str
    id_partner: str
    is_children: bool
    slots: list[SlotJson]


class Partner(BaseModel):
    partner_id: str
    name: str
    link: str


class PartnerRequest(BaseModel):
    name: str | None = None
    link: str | None = None


class Admin(BaseModel):
    email: str
    is_owner: bool
