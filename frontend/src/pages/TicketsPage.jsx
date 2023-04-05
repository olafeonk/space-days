import Header from "../components/Header";
import Footer from "../components/Footer";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const form = {
  phone: "",
  birthdate: "",
};

const tickets = [
  {
    number: 1234567890,
    event: "Название",
    date: "08.04.2023",
    time: "11:00",
    location: "Толмачева, 12, зал Космос",
  },
  {
    number: 1234567890,
    event: "Название",
    date: "08.04.2023",
    time: "11:00",
    location: "Толмачева, 12, зал Космос",
  },
];

const TicketsPage = () => {
  const body = renderBody(0);
  return (
    <Container
      style={{ display: "flex", "flex-direction": "column", height: "100vh" }}
    >
      <Header />
      {body}
      <Footer />
    </Container>
  );
};

function renderBody(sw) {
  const res1 = (
    <Container className="tickets-page">
      <Form className="tickets-page__form">
        <Form.Group controlId="formPhone">
          <Form.Label>Телефон</Form.Label>
          <Form.Control
            type="tel"
            className="rounded"
            value={form.phone}
            //   onChange={(event) => onChange({ ...form, phone: event.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="formBirthday">
          <Form.Label>Дата рождения</Form.Label>
          <Form.Control
            type="date"
            className="rounded"
            value={form.birthdate}
            //   onChange={(event) =>
            //     onChange({ ...form, birthdate: event.target.value })
            // }
          />
        </Form.Group>
        <Button
          // disabled={registrationDisabled}
          variant="outline-primary"
          type="submit"
          className="rounded d-flex flex-column justify-content-center align-items-center"
          // onClick={handleRegister}
        >
          Показать билеты
        </Button>
      </Form>
    </Container>
  );

  const res2 = (
    <Container className="tickets-page tickets-page_with-tickets">
      <Form className="tickets-page__form">
        <Form.Group controlId="formPhone">
          <Form.Label>Телефон</Form.Label>
          <Form.Control
            type="tel"
            className="rounded"
            value={form.phone}
            //   onChange={(event) => onChange({ ...form, phone: event.target.value })}
          />
        </Form.Group>
        <Form.Group controlId="formBirthday">
          <Form.Label>Дата рождения</Form.Label>
          <Form.Control
            type="date"
            className="rounded"
            value={form.birthdate}
            //   onChange={(event) =>
            //     onChange({ ...form, birthdate: event.target.value })
            // }
          />
        </Form.Group>
        <Button
          // disabled={registrationDisabled}
          variant="outline-primary"
          type="submit"
          className="rounded d-flex flex-column justify-content-center align-items-center"
          // onClick={handleRegister}
        >
          Показать билеты
        </Button>
      </Form>
      {getTickets(tickets)}
    </Container>
  );

  return sw ? res1 : res2;
}

function getTickets(tickets) {
  return tickets.map((ticket) => {
    return (
      <div className="ticket-wrapper">
        <div>
          <p className="ticket__number">№ {ticket.number}</p>
          <p className="ticket__event">{ticket.event}</p>
          <p className="ticket__date">
            <span>Дата: </span>
            {ticket.date}
          </p>
          <p className="ticket__time">
            <span>Время: </span>
            <span className="rounded-pill">{ticket.time}</span>
          </p>
          <p className="ticket__location">
            <span>Адрес: </span>
            {ticket.location}
          </p>
          <p className="ticket__info">
            Для того, чтобы пройти на мероприятие — назовите номер билета
          </p>
        </div>
      </div>
    );
  });
}

export default TicketsPage;
