import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import ParentForm from "../components/ParentForm";
import { getEvent, subscribeEvent } from "../apis/backend";
import { padTime, pluralize, convertDate, convertTime } from "../core";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Ticket from "../components/Ticket";
import Loader from "../components/Loader";
import Error from "../components/Error";

const STATUS_LOADING = 0;
const STATUS_ERROR = -1;
const STATUS_LOADED = 1;
const STATUS_SUCCESS = 2;

// TODO блокировать кнопку регистрации во время кручения!

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
  const [form, handleFormChange] = useForm();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleRegister = async () => {
    const result = await subscribeEvent(slot.slot_id, form);
    if (result.ok) {
      const ticket = result.body;
      setErrorMessage(null);
      setStatus(STATUS_SUCCESS);
      setTicket(ticket);
      saveRegistrationForm(form);
      return;
    }

    if (result.status === 409) {
      const reason =
        result.body && result.body.headers && result.body.headers.reason;
      const amount =
        result.body && result.body.headers && result.body.headers.amount;
      if (reason === "already_registered") {
        setErrorMessage("Вы уже регистрировались на это мероприятие");
      } else if (reason === "no_tickets") {
        const msg = `${pluralize(
          amount,
          "Остался",
          "Осталось",
          "Осталось"
        )} только ${amount} ${pluralize(amount, "билет", "билета", "билетов")}`;
        setErrorMessage(msg);
      } else {
        setErrorMessage("Конфликт при регистрации");
      }
      return;
    }

    if (result.status === 422) {
      setErrorMessage("Ошибка в заполнении формы");
      return;
    }

    if (result.status === 400) {
      const reason =
        result.body && result.body.headers && result.body.headers.reason;
      if (reason === "too more child") {
        setErrorMessage("Добавлено более 3-х детей");
      } else if (reason === "slot not available") {
        setErrorMessage("Время недоступно");
      } else {
        setErrorMessage("Некорретные данные");
      }
      return;
    }

    setErrorMessage(null);
    setStatus(STATUS_ERROR);
    setTicket(null);
  };

  switch (status) {
    case STATUS_LOADING:
      return renderLoading();
    case STATUS_LOADED:
      return renderLoaded(
        form,
        event,
        slot,
        errorMessage,
        handleFormChange,
        handleRegister
      );
    case STATUS_SUCCESS:
      return renderSuccess(event, slot, ticket);
    default:
      return renderError();
  }
};

function renderLoading() {
  return (
    <Container
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header />
      <Loader />
      <Footer />
    </Container>
  );
}

function renderLoaded(
  form,
  event,
  slot,
  errorMessage,
  handleFormChange,
  handleRegister
) {
  const { title, location, description, duration, age } = event;
  const dateTime = convertTime(slot.start_time);
  const registrationDisabled = !checkFormFilled(form);
  const slotFromEvent = event.slots.filter(
    (s) => s.slot_id === slot.slot_id
  )[0];
  const available =
    (slotFromEvent && slotFromEvent.available_users) || "0";

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
            <span className="event-card__title">Возраст:</span> {age}
          </p>
          <p>
            <span className="event-card__title">Продолжительность:</span>{" "}
            {`${duration} ${pluralize(duration, "минута", "минуты", "минут")}`}
          </p>
          <p>
            <span>Адрес: </span>
            {location}
          </p>
          <p>
            <span>Осталось мест: </span>
            {available}
          </p>
          <p>{description}</p>
        </Col>
      </Row>
      <Row className="registration-info__button">
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
      <Row className="mx-4">
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
          <h3
            className={"text-danger"}
            style={{ textAlign: "center", padding: 10 }}
          >
            {errorMessage}
          </h3>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
}

function renderSuccess(event, slot, ticket) {
  return <Ticket event={event} slot={slot} ticket={ticket} />;
}

function renderError() {
  return <Error />;
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

function useForm() {
  const savedForm = tryLoadRegistrationForm();
  const defaultForm = {
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
  };
  const [form, setForm] = useState(savedForm ? savedForm : defaultForm);

  const handleFormChange = useCallback((f) => {
    setForm(f);
  }, []);

  return [form, handleFormChange];
}

function saveRegistrationForm(form) {
  window.localStorage.setItem("form", JSON.stringify(form));
  window.localStorage.setItem("searchForm", null);
}

function tryLoadRegistrationForm() {
  try {
    const formString = window.localStorage.getItem("form");
    const form = formString ? JSON.parse(formString) : null;
    return form;
  } catch {
    return null;
  }
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

export default RegistrationPage;
