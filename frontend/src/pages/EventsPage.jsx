import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { LinkContainer } from "react-router-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import EventList from "../components/EventList";

const events = [
  {
    name: "Создание космических объектов с помощью 3D-ручек",
    image: "./image/banner_pic.png",
    date: "08.04.2023",
    times: ["09:00", "09:15", "09:30", "09:45"],
    age: "от 5 до 8 лет",
    duration: "10 минут",
    description:
      "Творческий мастер-класс на космическую тему. Вместе с педагогами Школы Программирования у вас появится возможность научится рисовать 3D-ручками и узнать очень многое об их устройстве.",
  },
  {
    name: "Создание космических объектов с помощью 3D-ручек",
    image: "./banner_pic.png",
    date: "08.04.2023",
    times: ["09:00", "09:15", "09:30", "09:45"],
    age: "от 5 до 8 лет",
    duration: "10 минут",
  },
  {
    name: "Создание космических объектов с помощью 3D-ручек",
    image: "./banner_pic.png",
    date: "08.04.2023",
    times: ["09:00", "09:15", "09:30", "09:45"],
    age: "от 5 до 8 лет",
    duration: "10 минут",
  },
];

const EventsPage = () => (
  <Container className="p-0">
    <ButtonToolbar className="custom-btn-toolbar">
      <LinkContainer to="/">
        <Button>Home</Button>
      </LinkContainer>
      <LinkContainer to="/events">
        <Button>Events</Button>
      </LinkContainer>
      <LinkContainer to="/registration">
        <Button>Registration</Button>
      </LinkContainer>
    </ButtonToolbar>
    <Row>
      <Col>
        <p>Инфографика</p>
      </Col>
    </Row>
    <Row className="dates-row">
      <Col>
        <Button
          className="date-button date-button_checked rounded-pill"
          variant="outline-dark"
        >
          8&nbsp;апреля
        </Button>
      </Col>
      <Col>
        <Button className="date-button rounded-pill" variant="outline-dark">
          9&nbsp;апреля
        </Button>
      </Col>
      <Col>
        <Button className="date-button rounded-pill" variant="outline-dark">
          10&nbsp;апреля
        </Button>
      </Col>
      <Col>
        <Button className="date-button rounded-pill" variant="outline-dark">
          11&nbsp;апреля
        </Button>
      </Col>
      <Col>
        <Button className="date-button rounded-pill" variant="outline-dark">
          12&nbsp;апреля
        </Button>
      </Col>
      <Col>
        <Button className="date-button rounded-pill" variant="outline-dark">
          13&nbsp;апреля
        </Button>
      </Col>
      <Col>
        <Button className="date-button rounded-pill" variant="outline-dark">
          14&nbsp;апреля
        </Button>
      </Col>
      <Col>
        <Button className="date-button rounded-pill" variant="outline-dark">
          15&nbsp;апреля
        </Button>
      </Col>
    </Row>
    <Row>
      <Col>
        <h1 className="day-title">День Открытия Фестиваля</h1>
        <h2 className="day-title_h2">8 апреля, суббота</h2>
      </Col>
    </Row>
    <Row className="time-row">
      <Col>
        <Button
          variant="outline-dark"
          className="time-button rounded-pill time-button_checked"
        >
          9:00
        </Button>
      </Col>
      <Col>
        <Button variant="outline-dark" className="time-button rounded-pill">
          10:00
        </Button>
      </Col>
      <Col>
        <Button variant="outline-dark" className="time-button rounded-pill">
          11:00
        </Button>
      </Col>
      <Col>
        <Button variant="outline-dark" className="time-button rounded-pill">
          12:00
        </Button>
      </Col>
      <Col>
        <Button variant="outline-dark" className="time-button rounded-pill">
          13:00
        </Button>
      </Col>
      <Col>
        <Button variant="outline-dark" className="time-button rounded-pill">
          14:00
        </Button>
      </Col>
      <Col>
        <Button variant="outline-dark" className="time-button rounded-pill">
          15:00
        </Button>
      </Col>
    </Row>
    <Row className="events-row">
      <Col className="d-flex flex-wrap">
        <EventList events={events} />
      </Col>
    </Row>
  </Container>
);

export default EventsPage;
