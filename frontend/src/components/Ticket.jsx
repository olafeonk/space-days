import { Container } from "react-bootstrap";
import { padTime } from "../core";
import Image from "react-bootstrap/Image";

const Ticket = ({event, slot, ticket}) => {
  const { title, location } = event;
  const dateTime = convertTime(slot.start_time);
  return (
    <Container className="ticket">
      <h1 className="ticket__title">Ваш билет на мероприятие</h1>
      <div className="ticket-wrapper">
        <div>
          <p className="ticket__number">№ {formatTicketId(ticket.ticket_id)}</p>
          <p className="ticket__event">{title}</p>
          <p className="ticket__date">
            <span>Дата: </span>
            {convertDate(dateTime.getDate())}
          </p>
          <p className="ticket__time">
            <span>Время: </span>
            <span className="rounded-pill">
              {`${padTime(dateTime.getHours())}:${padTime(
                dateTime.getMinutes()
              )}`}
            </span>
          </p>
          <p className="ticket__location">
            <span>Адрес: </span>
            {location}
          </p>
          <p className="ticket__location">
            <span>Количество участников: </span>
            {ticket.amount}
          </p>
          <p className="ticket__info">
            Для того, чтобы пройти на мероприятие — назовите номер билета
          </p>
        </div>
      </div>
      <div className="rounded-pill warning">
        <Image src="./image/warning.png" alt="внимание"></Image>
        <p>
          Вся необходимая информация о мероприятии будет выслана на вашу почту
        </p>
      </div>
    </Container>
  );
};

function formatTicketId(ticketId) {
  return `${ticketId.substr(0, 3)} ${ticketId.substr(3, 3)} ${ticketId.substr(6)}`;
}

function convertDate(dayOfMonth) {
  return `${padTime(dayOfMonth)}.04.2023`;
}

function convertTime(time) {
  const t = time.split("+")[0];
  return new Date(t);
}

export default Ticket;
