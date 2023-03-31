import React from "react";
import EventCard from "./EventCard";

const EventList = ({ events, onRegister }) => {
  return events.map((event) => <EventCard event={event} key={event.id} onRegister={onRegister} />);
};

export default React.memo(EventList);
