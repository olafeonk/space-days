import { API_BASE_URL } from "../constants";

export async function getEvent(id) {
    if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/events/?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("HTTP error: " + response.status);
            return null;
        }
    } else {
        return delay(1000).then(() => sampleByIdEvents);
    }
}

export async function getEventsByDays(days) {
    if (API_BASE_URL) {
        const daysQuery = days.map(d => `days=${d}`).join('&');
        const response = await fetch(`${API_BASE_URL}/events/?${daysQuery}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("HTTP error: " + response.status);
            return null;
        }
    } else {
        return delay(1000).then(() => sampleByDaysEvents);
    }
}

export async function getEventsByHours(day, hours) {
    if (API_BASE_URL) {
        const hoursQuery = hours.map(d => `hours=${d}`).join('&');
        const response = await fetch(`${API_BASE_URL}/events/?days=${day}&${hoursQuery}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("HTTP error: " + response.status);
            return null;
        }
    } else {
        return delay(1000).then(() => sampleByHoursEvents);
    }
}

export async function subscribeEvent(slotId, form, force = false) {
    if (API_BASE_URL) {
        const body = {
            first_name: form.name,
            last_name: form.surname,
            phone: form.phone, // TODO format
            birthdate: form.birthdate, // TODO format "2023-03-24"
            email: form.email, // TODO format
            child: form.hasChildren
                ? form.children.map((it) => ({
                    first_name: it.name,
                    age: it.age,
                }))
                : [],
            slot_id: slotId,
            force_registration: force,
        };

        const response = await fetch(`${API_BASE_URL}/events/subscribe`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            console.log("HTTP error: " + response.status);
            return null;
        }
    } else {
        return delay(1000).then(() => sampleTicket);
    }
}

function delay(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const sampleByIdEvents = [
    {
        event_id: 1,
        description: "string",
        location: "matmex",
        summary: "круто",
        title: "мероприятие на матмехе",
        slots: [
            {
                slot_id: 1,
                start_time: "2023-11-02T16:00:01+00:00",
                end_time: "2023-11-01T16:00:01+00:00",
                amount: 0,
                available_users: -2,
            },
        ],
    },
];

const sampleByDaysEvents = [
    {
        event_id: 1,
        description: "string",
        location: "matmex",
        summary: "круто",
        title: "Мероприятие 8 апреля",
        slots: [
            {
                slot_id: 1,
                start_time: "2023-04-08T11:00:01+00:00",
                end_time: "2023-04-08T11:30:01+00:00",
                amount: 0,
                available_users: 5,
            },
            {
                slot_id: 2,
                start_time: "2023-04-08T12:00:01+00:00",
                end_time: "2023-04-08T12:30:01+00:00",
                amount: 0,
                available_users: 5,
            },
            {
                slot_id: 3,
                start_time: "2023-04-08T16:00:01+00:00",
                end_time: "2023-04-08T16:30:01+00:00",
                amount: 0,
                available_users: 5,
            },
        ],
    },
    {
        event_id: 2,
        description: "string",
        location: "matmex",
        summary: "еще круче",
        title: "Еще одно мероприятие",
        slots: [
            {
                slot_id: 4,
                start_time: "2023-04-08T16:00:01+00:00",
                end_time: "2023-04-08T16:30:01+00:00",
                amount: 0,
                available_users: 5,
            },
        ],
    },
];

const sampleByHoursEvents = [
    {
        event_id: 1,
        description: "string",
        location: "matmex",
        summary: "круто",
        title: "Мероприятие 8 апреля",
        slots: [
            {
                slot_id: 1,
                start_time: "2023-04-08T11:00:01+00:00",
                end_time: "2023-04-08T11:30:01+00:00",
                amount: 0,
                available_users: 5,
            }
        ],
    },
];


const sampleTicket = {
    ticket_id: 570311949,
    user_id: 2,
    slot_id: 1,
    amount: 0,
};
