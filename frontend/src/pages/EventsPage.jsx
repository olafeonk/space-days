import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { LinkContainer } from "react-router-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import EventList from "../components/EventList";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { padTime, pluralize } from "../core";
import { getEventsByDays, getEventsByHours } from "../apis/backend";
import Image from "react-bootstrap/Image";

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
  const navigate = useNavigate();
  const handleRegister = useCallback(
    (event, time) => {
      navigate(`/registration?eventId=${event.id}&slotId=${time.slotId}`);
    },
    [status, content]
  );

  const body = renderBody(status, content, handleRegister);

  return (
    <Container className="p-0">
      <Header />
      {body}
      <Footer />
    </Container>
  );
};

function renderBody(status, content, handleRegister) {
  switch (status) {
    case STATUS_LOADING:
      return renderLoading();
    case STATUS_LOADED:
      return renderLoaded(content, handleRegister);
    case STATUS_SUCCESS:
      return renderSuccess();
    default:
      return renderError();
  }
}

function renderLoading() {
  return <h1 style={{ textAlign: "center" }}>Загрузка</h1>;
}

function renderLoaded(content, handleRegister) {
  const { events, day, hour } = content;

  return (
    <>
      <Row>
        <Col>
          <a href="./">
            <Image src="./image/arrow.png" alt="назад"></Image>
          </a>
        </Col>
      </Row>
      {renderDayMenu(day)}
      <Row>
        <Col>
          <h1 className="day-title">День Открытия Фестиваля</h1>
          <h2 className="day-title_h2">{dayMap[day]}</h2>
        </Col>
      </Row>
      {day === 8 && renderTimeMenu(day, hour)}
      <Row className="events-row justify-content-between">
        <EventList events={events} onRegister={handleRegister} />
      </Row>
    </>
  );
}

function renderDayMenu(day) {
  const days = [8, 9, 10, 11, 12, 13, 14, 15];
  const result = days.map((it, index) => {
    const className = `date-button rounded-pill ${
      it === day ? "date-button_checked" : ""
    }`;
    return (
      <LinkContainer
        key={index}
        to={{ pathname: "/events", search: `?day=${it}` }}
      >
        <Button className={className} variant="outline-dark">
          {`${it}\u00A0апреля`}
        </Button>
      </LinkContainer>
    );
  });
  return (
    <div
      className="btn-group dates-row row"
      role="group"
      aria-label="Basic radio toggle button group"
    >
      {result}
    </div>
  );
}

function renderTimeMenu(day, hour) {
  const hours = [11, 12, 13, 14, 15];
  return (
    <Row className="time-row">
      {hours.map((h) => {
        const className = `time-button rounded-pill ${
          h === hour ? "time-button_checked" : ""
        }`;
        return (
          <Col key={h}>
            <LinkContainer
              to={{ pathname: "/events", search: `?day=${day}&hour=${h}` }}
            >
              <Button variant="outline-dark" className={className}>
                {`${padTime(h)}:00`}
              </Button>
            </LinkContainer>
          </Col>
        );
      })}
    </Row>
  );
}

function renderSuccess() {
  return <h1 style={{ textAlign: "center" }}>Успех</h1>;
}

function renderError() {
  return <h1 style={{ textAlign: "center" }}>Ошибка</h1>;
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
      hasSeats: s.available_users > 0,
      slotId: s.slot_id,
    };
    return t;
  });
  const hasSeats = times.some((t) => t.hasSeats);
  const image = backendEvent.id_partner
    ? `./image/partners/${backendEvent.id_partner}.png`
    : DEFAULT_EVENT_IMAGE;

  const result = {
    id: backendEvent.event_id,
    title: backendEvent.title,
    image: image,
    hasSeats: hasSeats,
    date: date,
    times: times.sort((a, b) => (a.time > b.time) - (a.time < b.time)),
    age: backendEvent.age,
    duration: `${backendEvent.duration} ${pluralize(
      backendEvent.duration,
      "минута",
      "минуты",
      "минут"
    )}`,
    summary: backendEvent.summary,
    description: backendEvent.description,
    location: backendEvent.location,
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
