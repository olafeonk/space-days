import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { LinkContainer } from "react-router-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import EventList from "../components/EventList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { padTime, pluralize } from "../core";
import { getEventsByDays, getEventsByHours } from "../apis/backend";

const DEFAULT_EVENT_IMAGE = "./image/planet_3.png";

const STATUS_LOADING = 0;
const STATUS_ERROR = -1;
const STATUS_LOADED = 1;
const STATUS_SUCCESS = 2;

const dayMap = {
  8: "8 апреля, суббота",
  9: "9 апреля, воскресенье",
  10: "10 апреля, понедельник",
  11: "11 апреля, вторник",
  12: "12 апреля, среда",
  13: "13 апреля, четверг",
  14: "14 апреля, пятница",
  15: "15 апреля, суббота",
};

const EventsPage = () => {
  const { status, content } = useLoading();

  const body = renderBody(status, content);

  return (
    <Container className="p-0">
      <Header />
      {body}
      <Footer />
    </Container>
  );
};

function renderBody(status, content) {
  switch (status) {
    case STATUS_LOADING:
      return renderLoading();
    case STATUS_LOADED:
      return renderLoaded(content);
    case STATUS_SUCCESS:
      return renderSuccess();
    default:
      return renderError();
  }
}

function renderLoading() {
  return <h1>Loading</h1>;
}

function renderLoaded(content) {
  const { events, day, hour } = content;

  return (
    <>
      <Row>
        <Col>
          <p>Инфографика</p>
        </Col>
      </Row>
      {renderDayMenu(day)}
      {day === 8 && renderTimeMenu(day, hour)}
      <Row>
        <Col>
          <h1 className="day-title">День Открытия Фестиваля</h1>
          <h2 className="day-title_h2">
            {dayMap[day]}
            {hour ? `, ${hour}:00` : ""}
          </h2>
        </Col>
      </Row>

      <Row className="events-row">
        <EventList events={events} />
      </Row>
    </>
  );
}

function renderDayMenu(day) {
  return (
    <Row className="dates-row">
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=8" }}>
          <Button
            className="date-button date-button_checked rounded-pill"
            variant="outline-dark"
          >
            8&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=9" }}>
          <Button className="date-button rounded-pill" variant="outline-dark">
            9&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=10" }}>
          <Button className="date-button  rounded-pill" variant="outline-dark">
            10&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=11" }}>
          <Button className="date-button  rounded-pill" variant="outline-dark">
            11&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=12" }}>
          <Button className="date-button  rounded-pill" variant="outline-dark">
            12&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=13" }}>
          <Button className="date-button  rounded-pill" variant="outline-dark">
            13&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=14" }}>
          <Button className="date-button  rounded-pill" variant="outline-dark">
            14&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
      <Col>
        <LinkContainer to={{ pathname: "/events", search: "?day=15" }}>
          <Button className="date-button  rounded-pill" variant="outline-dark">
            15&nbsp;апреля
          </Button>
        </LinkContainer>
      </Col>
    </Row>
  );
}

function renderTimeMenu(day, hour) {
  const hours = [9, 10, 11, 12, 13, 14, 15];
  return (
    <Row className="time-row">
      {hours.map((h) => (
        <Col>
          <LinkContainer
            to={{ pathname: "/events", search: `?day=${day}&hour=${h}` }}
          >
            <Button
              variant="outline-dark"
              className="time-button rounded-pill time-button_checked"
            >
              {`${padTime(h)}:00`}
            </Button>
          </LinkContainer>
        </Col>
      ))}
    </Row>
  );
}

function renderSuccess() {
  return <h1>Success</h1>;
}

function renderError() {
  return <h1>Error</h1>;
}

function useLoading() {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);
  const [status, setStatus] = useState(STATUS_LOADING);
  const [content, setContent] = useState({ events: [], day: null, hour: null });

  useEffect(() => {
    async function run() {
      const dayParameter = query.get("day");
      const hourParameter = query.get("hour");

      const day =
        dayParameter && !hourParameter ? parseInt(dayParameter, 10) : 8;
      const hour = hourParameter ? parseInt(hourParameter, 10) : null;

      const backendEvents = hour
        ? await getEventsByHours(day, [hour])
        : await getEventsByDays([day]);
      if (!backendEvents) {
        setStatus(STATUS_ERROR);
        return;
      }

      const events = backendEvents.map((event) => convertEvent(event, day));

      setContent({ events, day, hour });
      setStatus(STATUS_LOADED);
    }

    run();
  }, [query]);

  return { status, content };
}

function convertEvent(backendEvent, dayOfMonthNumber) {
  const date = convertDate(dayOfMonthNumber);
  const backendSlots = backendEvent.slots.filter((s) => {
    return convertTime(s.start_time).getDate() === dayOfMonthNumber;
  });
  const times = backendSlots.map((s) => {
    const d = convertTime(s.start_time);
    const t = {
      time: `${padTime(d.getHours())}:${padTime(d.getMinutes())}`,
      hasSlots: s.available_users > 0,
    };
    return t;
  });
  const hasSlots = times.some((t) => t.hasSlots);
  const image = backendEvent.logo
    ? `./image/partners/${backendEvent.logo}.png`
    : DEFAULT_EVENT_IMAGE;

  const result = {
    id: backendEvent.event_id,
    title: backendEvent.title,
    image: image,
    hasSlots: hasSlots,
    date: date,
    times: times,
    age: backendEvent.age,
    duration: `${backendEvent.duration} ${pluralize(
      backendEvent.duration,
      "минута",
      "минуты",
      "минут"
    )}`,
    summary: backendEvent.summary,
    description: backendEvent.description,
    location: backendEvent.location, // куда воткнуть
  };

  return result;
}

function convertDate(dayOfMonth) {
  return `${padTime(dayOfMonth)}.04.2023`;
}

function convertTime(time) {
  const t = time.split("+")[0];
  return new Date(t);
}

export default EventsPage;
