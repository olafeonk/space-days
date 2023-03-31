import React, { useState } from "react";
import Image from "react-bootstrap/Image";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const EventCard = ({ event, onRegister }) => {
  const [slot, setSlot] = useState(null);
  const handleRegister = () => {
    onRegister && onRegister(event, slot);
  };

  return (
    <Col className="event-card" as={"article"}>
      <div className="img-wrapper">
        <Image fluid rounded src={event.image}></Image>
      </div>
      <div>
        <h3>{event.title}</h3>
        <hr></hr>
        <div>
          <span className="event-card__title">Дата:</span>{" "}
          <span>{event.date}</span>
        </div>
        <div className="slots">
          <span className="event-card__title">Время:</span>{" "}
          <div
            className="btn-group slot-times"
            role="group"
            aria-label="Basic radio toggle button group"
          >
            {renderSlots(event.times, slot, setSlot)}
          </div>
        </div>
        <div>
          <span className="event-card__title">Возраст:</span>{" "}
          <span>{event.age}</span>
        </div>
        <div className="event-card__duration">
          <span className="event-card__title">Продолжительность:</span>{" "}
          <span>{event.duration}</span>
        </div>
        <div className="event-card__location">
          <span className="event-card__title">Место мероприятия:</span>{" "}
          <span>{event.location}</span>
        </div>
        <p>{event.summary}</p>
      </div>
      <Button
        variant="outline-primary"
        className="rounded-pill event-card__button"
        onClick={handleRegister}
      >
        Зарегистрироваться
      </Button>
    </Col>
  );
};

function renderSlots(times, slot, setSlot) {
  const result = times.sort().map((it, index) => {
    if (!it.hasSeats) {
      return (
        <span
          key={index}
          className="event-card__time time-button rounded-pill time-button_disabled"
        >
          {it.time}
        </span>
      );
    }

    const className = `event-card__time time-button rounded-pill ${
      it.slotId === (slot && slot.slotId) ? " time-button_checked" : ""
    }`;
    return (
      <span key={index} className={className} onClick={() => setSlot(it)}>
        {it.time}
      </span>
    );
  });

  return result;
}

export default EventCard;
