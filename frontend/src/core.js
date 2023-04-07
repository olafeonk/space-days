export function padTime(value) {
    return value < 10 ? `0${value}` : `${value}`;
}

export function pluralize(count, one, two, five) {
    if (count % 10 === 0 || count % 10 >= 5 || count % 100 > 10 && count % 100 < 20) return five;
    return count % 10 === 1 ? one : two;
}

export function formatTicketId(ticketId) {
    const str = `${ticketId}`;
    return `${str.substr(0, 3)} ${str.substr(3, 3)} ${str.substr(6)}`;
  }
  
export function convertDate(dayOfMonth) {
    return `${padTime(dayOfMonth)}.04.2023`;
}
  
export function convertTime(time) {
    const t = time.split("+")[0];
    return new Date(t);
}