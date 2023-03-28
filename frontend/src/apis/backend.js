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
        return delay(1000).then(() => sampleEvents);
    }
}

export async function subscribeEvent(slotId, form) {
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

const sampleEvents = [
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

const sampleTicket = {
    ticket_id: 570311949,
    user_id: 2,
    slot_id: 1,
    amount: 0,
};
