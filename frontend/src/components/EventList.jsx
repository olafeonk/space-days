import EventCard from "./EventCard";

const EventList = ({ events }) => {
  return events.map((event) => <EventCard event={event} key={event.id} />);
};

export default EventList;
