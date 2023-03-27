"use strict";

const API_BASE_URL = 'https://d5dhunj7miq7pks6r7fs.apigw.yandexcloud.net';

async function addMessage(name, title, text) {
    const body = {
        name: name,
        title: title,
        text: text,
    };
    const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, // вероятно это значение по умолчанию
        body: JSON.stringify(body) // возможно это не нужно 
    });

    const result = await response.json();

    return result;
}
