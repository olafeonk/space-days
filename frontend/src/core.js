export function padTime(value) {
    return value < 10 ? `0${value}` : `${value}`;
}

export function pluralize(count, one, two, five) {
    if (count % 10 === 0 || count % 10 >= 5 || count % 100 > 10 && count % 100 < 20) return five;
    return count % 10 === 1 ? one : two;
}
