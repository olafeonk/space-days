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

export const LogInSuppPage = () => {
    const ffn = function () {
        console.log("aaaaa");
        window.YaSendSuggestToken(
            'https://d5d01gtvhjuka0q70t5r.apigw.yandexcloud.net/#/admin',
            {
                flag: true
            }
        )

    }


    return (
        <>
            {ffn()}
        </>
    )
};
