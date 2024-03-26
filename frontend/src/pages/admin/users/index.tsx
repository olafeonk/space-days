// @ts-nocheck
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import styles from "./styles.module.css";
import React from "react";
import { useEffect, useState } from "react";
import classnames from "classnames";
import { getEvents } from "apis/backend";
import "commonStyles.css"
import { AddEventForm } from "./add-event";

export const AdminUsersPage = () => {
    const [modalActive, setModalActive] = useState(false);
    const [eventsList, setEventsList] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const eventsList = await getEvents();
            setEventsList(eventsList);
        }

        fetchData();
    }, []);


    return (
        <>
            <h1>Администраторы</h1>
            <hr className={styles.hr} />

        </>
    )
};
