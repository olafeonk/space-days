import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const EventCard = (props) => {
  const { event } = props;
  return (
    <Col className="event-card" as={"article"}>
      <Image fluid roundedCircle src={event.image}></Image>
      <div>
        <h3>{event.title}</h3>
        <hr></hr>
        <div>
          <span className="event-card__title">Дата:</span>{" "}
          <span>{event.date}</span>
        </div>
        <div>
          <span className="event-card__title">Время:</span>{" "}
          {event.times.map((it) => (
            <span
              key={it.time}
              className="event-card__time time-button rounded-pill"
            >
              {it.time}
            </span>
          ))}
        </div>
        <div>
          <span className="event-card__title">Возраст:</span>{" "}
          <span>{event.age}</span>
        </div>
        <div className="event-card__duration">
          <span className="event-card__title">Продолжительность:</span>{" "}
          <span>{event.duration}</span>
        </div>
        <p>{event.summary}</p>
      </div>
      <Button
        variant="outline-primary"
        className="rounded-pill event-card__button"
      >
        Зарегистрироваться
      </Button>
    </Col>
  );
};

export default EventCard;
