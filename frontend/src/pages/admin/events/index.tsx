// @ts-nocheck
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./styles.module.css";
import React from "react";
import { useEffect, useState } from "react";
import classnames from "classnames";
import { EditButton } from "components/buttons/edit-button";
import { DeleteButton } from "components/buttons/delete-button";
import { getEvents } from "apis/backend";
import "commonStyles.css"
import { AddEventForm } from "./add-event";

export const AdminEventsPage = () => {
    const [modalActive, setModalActive] = useState(false);
    const [eventsList, setEventsList] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const eventsList = await getEvents();
            setEventsList(eventsList);
        }

        fetchData();
    }, []);

    const eventsListComponent = <div className={styles.table}>
        <div className={classnames(styles.row, styles.titles)}>
            <h3>Партнёр</h3>
            <h3>Название</h3>
            <h3>Крт. описание</h3>
            <h3>Полное описание</h3>
            <h3>Возраст</h3>
            <h3>Продол-ть</h3>
        </div>
        {eventsList.map(event => {
            let imgSrc;
            try {
                imgSrc = require(`shared/image/partners/${event.id_partner}.png`);
            }
            catch {
                imgSrc = require(`shared/image/partners/default.png`);
            }
            return (
                <div className={styles.row} id={event.event_id} key={event.event_id}>
                    <Image src={imgSrc} className={styles.logo} />
                    <span>{event.title}</span>
                    <span>{event.summary}</span>
                    <span className={styles.description}>{event.description}</span>
                    <span>{event.age}</span>
                    <span>{event.duration}</span>
                    <div className={styles.buttons}>
                    </div>
                </div>)
        })}
    </div>

    return (
        <>
            <h1>Мероприятия</h1>
            <hr className={styles.hr} />
            {!modalActive && <Button
                className={classnames("outline-primary", styles.addButton)}
                variant="outline-primary"
                onClick={() => setModalActive(true)}
            >
                Добавить мероприятие
            </Button>}
            <div className={styles.pageButtons}>
                <span className={!modalActive ? classnames(styles.allEventsButton, styles.activeWindow) : styles.allEventsButton} onClick={() => { setModalActive(false) }}>Все мероприятия</span>
                <span className={modalActive ? classnames(styles.editEventButton, styles.activeWindow) : styles.editEventButton} >Редактор</span>
            </div>
            {modalActive ? <AddEventForm /> : eventsListComponent}
        </>
    )
};
