import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import ParentForm from "../components/ParentForm";
import { getEvent, subscribeEvent } from "../apis/backend";
import { padTime } from "../core";
import Header from "../components/Header";
import Footer from "../components/Footer";

const STATUS_LOADING = 0;
const STATUS_ERROR = -1;
const STATUS_LOADED = 1;
const STATUS_SUCCESS = 2;

// todo
// - Навести красоту + описание мероприятия
// - Добавить маску к телефону и email (браузер? на уровне React.bootstrap?)

// 1. Получаем event_id, slot_id и получаем event, находим там слот. Если чего-то нет, то Страница ошибки типа 404 (со ссылок на вернуться назад)
// 2. Прошлые даныне пользователя подтянулись из localStorage
// 3. Пользователь заполнил данные
// 4. Нажатие на кнопку отправки (тут предусмотреть проверку и ошибку)
// 5. Форматирование значений перед отправкой
// 6. Запрос на сервер, показываем страницу успеха (со ссылкой записаться еще)

const RegistrationPage = () => {
  const { status, event, slot, setStatus } = useEventLoading();
  const [ticket, setTicket] = useState(null);

  const [form, setForm] = useState({
    surname: "",
    name: "",
    birthdate: "",
    phone: "",
    email: "",
    hasChildren: false,
    children: [
      {
        name: "",
        age: "",
      },
    ],
  });

  const handleFormChange = useCallback((f) => {
    setForm(f);
  }, []);

  const handleRegister = async () => {
    const ticket = await subscribeEvent(slot.slot_id, form);
    if (ticket) {
      setStatus(STATUS_SUCCESS);
      setTicket(ticket);
    } else {
      setStatus(STATUS_ERROR);
      setTicket(null);
    }
  };

  switch (status) {
    case STATUS_LOADING:
      return renderLoading();
    case STATUS_LOADED:
      return renderLoaded(form, event, slot, handleFormChange, handleRegister);
    case STATUS_SUCCESS:
      return renderSuccess(event, slot, ticket);
    default:
      return renderError();
  }
};

function renderLoading() {
  return <h1 style={{ textAlign: "center" }}>Загрузка</h1>;
}

function renderLoaded(form, event, slot, handleFormChange, handleRegister) {
  const { title, location, description } = event;
  const dateTime = convertTime(slot.start_time);
  const registrationDisabled = !checkFormFilled(form);

  return (
    <Container>
      <Header />
      <Row>
        <Col className="rules">
          <a href="./#/events">
            <Image src="./image/arrow.png" alt="назад"></Image>
          </a>
          <div className="rounded-pill warning">
            <Image src="./image/warning.png" alt="внимание"></Image>
            <p>
              Регистрировать нужно <span>каждого участника</span>, включая
              детей!
            </p>
          </div>
        </Col>
      </Row>
      <Row className="registration-info">
        <Col className="registration-form">
          <ParentForm form={form} onChange={handleFormChange} />
        </Col>
        <Col className="registration-info__event">
          <h1>{title}</h1>
          <p>
            <span>Дата: </span>
            {convertDate(dateTime.getDate())}
          </p>
          <p>
            <span>Время: </span>
            {`${padTime(dateTime.getHours())}:${padTime(
              dateTime.getMinutes()
            )}`}
          </p>
          <p>
            <span>Адрес: </span>
            {location}
          </p>
          <p>{description}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            disabled={registrationDisabled}
            variant="outline-primary"
            type="submit"
            className="rounded-pill d-flex flex-column justify-content-center align-items-center w-100 registration-page__button"
            onClick={handleRegister}
          >
            Зарегистрироваться
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column policy justify-content-center align-items-center w-100">
          <p>
            Нажимая кнопку, вы соглашаетесь с{" "}
            <a href="https://kantrskrip.ru/privacy_policy">
              Политикой конфиденциальности
            </a>{" "}
            и{" "}
            <a href="https://kantrskrip.ru/agreement">
              Пользовательским соглашением
            </a>
            .
          </p>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
}

function renderSuccess(event, slot, ticket) {
  // {"ticket_id":289977493,"user_id":2,"slot_id":52,"amount":0}
  const { title, location } = event;
  const dateTime = convertTime(slot.start_time);

  return (
    <>
      <h1 style={{ textAlign: "center" }}>Ваш билет на мероприятие</h1>
      <p>№ {ticket.ticket_id}</p>
      <p>{title}</p>
      <p>Дата: {convertDate(dateTime.getDate())}</p>
      <p>
        Время:{" "}
        {`${padTime(dateTime.getHours())}:${padTime(dateTime.getMinutes())}`}
      </p>
      <p>Адрес: {location}</p>
    </>
  );
}

function renderError() {
  return <h1 style={{ textAlign: "center" }}>Ошибка</h1>;
}

function checkFormFilled(form) {
  const { surname, name, birthdate, phone, email } = form;

  if (
    surname &&
    surname.length > 0 &&
    name &&
    name.length > 0 &&
    birthdate &&
    birthdate.length > 0 &&
    phone &&
    phone.length > 0 &&
    email &&
    email.length > 0
  ) {
    return true;
  }

  return false;
}

function checkFormFilled(form) {
  const { surname, name, birthdate, phone, email } = form;

  if (
    surname &&
    surname.length > 0 &&
    name &&
    name.length > 0 &&
    birthdate &&
    birthdate.length > 0 &&
    phone &&
    phone.length > 0 &&
    email &&
    email.length > 0
  ) {
    return true;
  }

  return false;
}

function checkFormFilled(form) {
  const { surname, name, birthdate, phone, email } = form;

  if (
    surname &&
    surname.length > 0 &&
    name &&
    name.length > 0 &&
    birthdate &&
    birthdate.length > 0 &&
    phone &&
    phone.length > 0 &&
    email &&
    email.length > 0
  ) {
    return true;
  }

  return false;
}

function checkFormFilled(form) {
  const { surname, name, birthdate, phone, email } = form;

  if (
    surname &&
    surname.length > 0 &&
    name &&
    name.length > 0 &&
    birthdate &&
    birthdate.length > 0 &&
    phone &&
    phone.length > 0 &&
    email &&
    email.length > 0
  ) {
    return true;
  }

  return false;
}

function useEventLoading() {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);
  const [status, setStatus] = useState(STATUS_LOADING);
  const [eventAndSlot, setEventAndSlot] = useState({ event: null, slot: null });

  useEffect(() => {
    async function run() {
      const eventId = parseInt(query.get("eventId"), 10);
      const slotId = parseInt(query.get("slotId"), 10);

      const events = (await getEvent(eventId)) || [];
      const event = events[0];
      if (!event) {
        setStatus(STATUS_ERROR);
        return;
      }

      const slot = event.slots.filter((s) => s.slot_id === slotId)[0];
      if (!slot) {
        setStatus(STATUS_ERROR);
        return;
      }

      setEventAndSlot({ event, slot });
      setStatus(STATUS_LOADED);
    }

    run();
  }, [query]);

  return {
    status,
    event: eventAndSlot.event,
    slot: eventAndSlot.slot,
    setStatus,
  };
}

function convertDate(dayOfMonth) {
  return `${padTime(dayOfMonth)}.04.2023`;
}

function convertTime(time) {
  const t = time.split("+")[0];
  return new Date(t);
}

export default RegistrationPage;
