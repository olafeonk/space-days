from __future__ import annotations
import ydb
import ydb.iam
from app.config import YDB_DATABASE, YDB_ENDPOINT
from random import randint
from datetime import date, timedelta
import app.domain.model as model
import logging


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

py_formatter = logging.Formatter("%(name)s %(asctime)s %(levelname)s %(message)s")

stream_handler = logging.StreamHandler()
stream_handler.setFormatter(py_formatter)
logger.addHandler(stream_handler)


def get_count_table(repository: Repository, name_table: str) -> int:
    logger.info(name_table)
    return (repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT COUNT(*) as count FROM {}; 
    """.format(YDB_DATABASE, name_table), {}))[0].rows[0].count


def get_count_available_tickets(repository: Repository) -> dict[int, int]:
    result_query = (repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT slots.slot_id AS slot_id, CAST(amount AS Int64) - COALESCE(sum,0) AS available_ticket FROM slots
    LEFT JOIN (
        SELECT slot_id, SUM(amount) AS sum FROM ticket
        GROUP BY slot_id) as t
    ON slots.slot_id = t.slot_id;

    """.format(YDB_DATABASE), {}))[0].rows
    available_tickets = {}
    logger.info(result_query)
    for row in result_query:
        available_tickets[row.slot_id] = row.available_ticket
    return available_tickets


def generate_ticket_id(repository: Repository) -> int:
    for _ in range(20):
        ticket_number = randint(int(1e8), int(1e9) - 1)
        ticket = repository.execute("""PRAGMA TablePathPrefix("{}");
            SELECT * FROM ticket
            WHERE ticket_id = {};
         """.format(YDB_DATABASE, ticket_number), {})[0].rows
        if not ticket:
            return ticket_number
    raise RecursionError("Can`t generate ticket id")


def is_available_slot(repository: Repository, slot_id: int) -> bool:
    return (repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT slot_id FROM slots WHERE slot_id = {};
   """.format(YDB_DATABASE, slot_id), {}))[0].rows


def is_user_already_registration(repository: Repository, slot_id: int, user_id: str) -> bool:
    logger.info(user_id)
    return (repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT * FROM ticket VIEW slot_id_index
        WHERE user_id = "{}" AND slot_id = {};
    """.format(YDB_DATABASE, user_id, slot_id), {}))[0].rows


def update_data_user(repository: Repository, email: str, first_name: str, last_name: str, birthdate: date,
                           phone: str) -> bool:
    return (repository.execute("""PRAGMA TablePathPrefix("{}");
        UPDATE user
        SET email="{}", first_name="{}", last_name="{}", birthdate = Date("{}")
        WHERE phone = "{}";
    """.format(YDB_DATABASE, email, first_name, last_name, birthdate, phone), {}))


def is_children_event(repository: Repository, slot_id: int) -> bool:
    event = (repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT is_children FROM event
        INNER JOIN slots
        ON event.event_id = slots.event_id
        where slot_id = {};""".format(YDB_DATABASE, slot_id), {}))[0].rows
    if event:
        return event[0].is_children
    return False


def save_new_mailing(repository: Repository, mailing: model.SendingLog):
    repository.execute("""PRAGMA TablePathPrefix("{}");
        DECLARE $mailingData AS List<Struct<
            mailing_id: Utf8,
            adult_count: Int64,
            child_count: Int64,
            ticket_id: Uint64,
            is_send: bool,
            created_at: Utf8>>;

        INSERT INTO mailings
        SELECT 
            mailing_id,
            adult_count,
            child_count,
            ticket_id,
            is_send,
            CAST(created_at AS Datetime) AS created_at
        FROM AS_TABLE($mailingData);
    """.format(YDB_DATABASE), {"$mailingData": [mailing]})


def get_user(repository: Repository, phone: str) -> model.User | None:
    user = (repository.execute("""PRAGMA TablePathPrefix("{}");
    SELECT * FROM user
    WHERE phone = "{}";
    """.format(YDB_DATABASE, phone), {}))[0].rows
    if user:
        logger.info(user[0])
        return model.User(
            user_id=user[0].user_id,
            first_name=user[0].first_name,
            last_name=user[0].last_name,
            phone=user[0].phone,
            email=user[0].email,
            birthdate=date(1970, 1, 1) + timedelta(days=user[0].birthdate))


def get_user_by_ticket(repository: Repository, ticket_id: int) -> model.User:
    user = (repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT DISTINCT user.user_id AS user_id, first_name, last_name, phone, birthdate, email FROM ticket
        INNER JOIN user
        ON user.user_id = ticket.user_id
        WHERE ticket.ticket_id = {};
        """.format(YDB_DATABASE, ticket_id), {}))[0].rows
    if user:
        logger.info(user[0])
        return model.User(**user[0])


def get_tg_user(repository: Repository, telegram_id: int) -> model.TelegramUser | None:
    tg_user = (repository.execute("""PRAGMA TablePathPrefix("{}");
        SELECT * FROM tg_user
        WHERE telegram_id = {};
    """.format(YDB_DATABASE, telegram_id), {}))[0].rows
    if tg_user:
        return model.TelegramUser(**tg_user[0])


def save_tg_user(repository: Repository, telegram_user: model.TelegramUser) -> None:
    logger.info(telegram_user.dict())
    repository.execute("""PRAGMA TablePathPrefix("{}");
    
        DECLARE $tgUserData AS List<Struct<
            tg_user_id: Uint64,
            user_id: Uint64,
            first_name: Utf8,
            last_name: Utf8?,
            telegram_id: Int64,
            username: Utf8,
            type_user: Utf8>>;
        
        INSERT INTO tg_user
        SELECT
            tg_user_id,
            user_id,
            first_name,
            last_name,
            telegram_id,
            username,
            type_user
        FROM AS_TABLE($tgUserData);
    """.format(YDB_DATABASE), {"$tgUserData": [telegram_user]})


class Repository:
    def __init__(self):
        self.driver = ydb.Driver(endpoint=YDB_ENDPOINT, database=YDB_DATABASE,
                                 credentials=ydb.iam.ServiceAccountCredentials.from_file(
                                         'service-key.json'))
        self.pool = ydb.SessionPool(self.driver, size=10)

    def connect(self):
        self.driver.wait(fail_fast=True)
        return self

    def executeOld(self, query: str, data: dict):
        logger.info(query)

        session = self.pool.acquire()
        prepared_query = session.prepare(query)
        result_transaction = session.transaction(ydb.SerializableReadWrite()).execute(
            prepared_query,
            data,
            commit_tx=True,
        )
        self.pool.release(session)
        return result_transaction
    
    def execute(self, query: str, data: dict):
        def executeInSession(session):
            prepared_query = session.prepare(query)

            ## Пример с явной транзакцией из нескольких запросов
            ## Обязательное условие для выполнения транзакции: сначала все чтения, затем все записи
            ## Пример отсюда: https://github.com/ydb-platform/ydb-python-sdk/blob/main/examples/basic_example_v1/basic_example.py
            # tx = session.transaction(ydb.SerializableReadWrite()).begin()
            # tx.execute(prepared_query, data)
            # tx.commit()

            return session.transaction().execute(
                prepared_query,
                data,
                commit_tx=True)

        logger.info(query)
        result = self.pool.retry_operation_sync(executeInSession)
        return result
