import React, { useState, useRef, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { padTime, pluralize, formatTicketId, convertDate, convertTime } from "../core";
import { getMyTickets } from "../apis/backend";
import Loader from "../components/Loader";
import Error from "../components/Error";

const STATUS_LOADING = 0;
const STATUS_ERROR = -1;
const STATUS_LOADED = 1;

const TicketsPage = () => {
  const savedFormString = window.localStorage.getItem("form");
  const savedForm = savedFormString && JSON.parse(savedFormString);

  const [form, setForm] = useState({
    phone: savedForm && savedForm.phone || "",
    birthdate: savedForm && savedForm.birthdate || "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [status, setStatus] = useState(STATUS_LOADED);
  const [tickets, setTickets] = useState([]);

  const handleFormChange = useCallback((f) => {
    setForm(f);
  }, []);

  const handleSubmit = async () => {
    setStatus(STATUS_LOADING);
    const result = await getMyTickets(form.phone, form.birthdate);
    if (result.ok) {
      setErrorMessage(null);
      setStatus(STATUS_LOADED);
      setTickets(result.body || []);
      return;
    }

    if (result.status === 422) {
      setErrorMessage("Ошибка в заполнении формы");
      setStatus(STATUS_LOADED);
      setTickets([]);
      return;
    }

    if (result.status === 404) {
      setErrorMessage("Пользователь не найден");
      setStatus(STATUS_LOADED);
      setTickets([]);
      return;
    }

    setErrorMessage(null);
    setStatus(STATUS_ERROR);
    setTickets([]);
  };

  // const autoSubmitRef = useRef(false);
  // if (!autoSubmitRef.current) {
  //   if (checkFormFilled(form)) {
  //     setTimeout(handleSubmit, 0);
  //   }
  //   autoSubmitRef.current = true;
  // }

  if (status === STATUS_ERROR) {
    return renderError();
  }
  return (
    <Container
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header />
      <Container className="tickets-page tickets-page_with-tickets">
        {renderForm(form, status, handleFormChange, handleSubmit)}
        <h3
          className={"text-danger"}
          style={{ textAlign: "center", padding: 10 }}
        >
          {errorMessage}
        </h3>
        {status === STATUS_LOADING ? <Loader /> : renderTickets(tickets)}
      </Container>
      <Footer />
    </Container>
  );
};

function renderError() {
  return <Error />;
}

function renderForm(form, status, handleFormChange, handleShowTickets) {
  const submitDisabled = !checkFormFilled(form) || status === STATUS_LOADING;
  return (
    <Form className="tickets-page__form">
      <Form.Group controlId="formPhone">
        <Form.Label>Телефон</Form.Label>
        <Form.Control
          type="tel"
          className="rounded"
          value={form.phone}
          onChange={(event) => handleFormChange({ ...form, phone: event.target.value })}
        />
      </Form.Group>
      <Form.Group controlId="formBirthday">
        <Form.Label>Дата рождения</Form.Label>
        <Form.Control
          type="date"
          className="rounded"
          value={form.birthdate}
          onChange={(event) =>
            handleFormChange({ ...form, birthdate: event.target.value })
          }
        />
      </Form.Group>
      <Button
        disabled={submitDisabled}
        variant="outline-primary"
        type="submit"
        className="rounded d-flex flex-column justify-content-center align-items-center"
        onClick={handleShowTickets}
      >
        Показать билеты
      </Button>
    </Form>
  );
}

function renderTickets(tickets) {
  return tickets.map((ticket) => {
    const dateTime = convertTime(ticket.start_time);

    return (
      <div className="ticket-wrapper" key={ticket.ticket_id}>
        <div>
          <p className="ticket__number">№ {formatTicketId(ticket.ticket_id)}</p>
          <p className="ticket__event">{ticket.title}</p>
          <p className="ticket__date">
            <span>Дата: </span>
            {convertDate(dateTime.getDate())}
          </p>
          <p className="ticket__time">
            <span>Время: </span>
            <span className="rounded-pill">{`${padTime(dateTime.getHours())}:${padTime(
              dateTime.getMinutes()
            )}`}</span>
          </p>
          <p className="ticket__location">
            <span>Адрес: </span>
            {ticket.location}
          </p>
          <p className="ticket__seats">
            {`${ticket.amount} ${pluralize(ticket.amount, 'участник', 'участника', 'участников')}`}
          </p>
          <p className="ticket__info">
            Для того, чтобы пройти на мероприятие — назовите номер билета
          </p>
        </div>
      </div>
    );
  });
}

function checkFormFilled(form) {
  const { birthdate, phone } = form;

  if (
    birthdate &&
    birthdate.length > 0 &&
    phone &&
    phone.length > 0
  ) {
    return true;
  }

  return false;
}

export default TicketsPage;
