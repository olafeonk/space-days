import Image from "react-bootstrap/Image";
import Button from "react-bootstrap/Button";

const EventCard = (props) => {
  const { event } = props;
  return (
    <article className="event-card">
      <Image fluid roundedCircle src={event.image}></Image>
      <div>
        <h3>{event.name}</h3>
        <hr></hr>
        <div>
          <span className="event-card__title">Дата:</span>{" "}
          <span>{event.date}</span>
        </div>
        <div>
          <span className="event-card__title">Время:</span>{" "}
          {event.times.map((it) => (
            <span className="event-card__time time-button rounded-pill">
              {it}
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
        <p>{event.description}</p>
      </div>
      <Button
        variant="outline-primary"
        className="rounded-pill event-card__button"
      >
        Зарегистрироваться
      </Button>
    </article>
  );
};

export default EventCard;
