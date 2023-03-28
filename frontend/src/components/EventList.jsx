import EventCard from "./EventCard";

const EventList = ({ events }) => {
  return events.map((event, index) => <EventCard event={event} key={index} />);
};

export default EventList;
