import React, { useState, useCallback, useEffect } from "react";
import SlotsForm from "components/SlotsForm";
import Button from "react-bootstrap/Button";
import { addEvent } from "apis/backend";
import styles from "./styles.module.css";
import classnames from "classnames";
import { getPartners } from "apis/backend";
import { useForm, SubmitHandler } from "react-hook-form";
import { BASE_URL } from "../../../../constants";

type TAddEventFormProps = {
  event?: any,
}

type Inputs = {
  description: string,
  location: string,
  summary: string,
  title: string,
  age: string,
  duration: string,
  date: string,
  is_children: true,
  slots: [
    {
      start_time: string,
      amount: string,
    },
  ],
}

export const AddEventForm = ({ event }: TAddEventFormProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    reset,
  } = useForm<Inputs>();

  const [errorMessage, setErrorMessage] = useState(null);

  const [partnersList, setpartnersList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const partnersList = await getPartners();
      setpartnersList(partnersList);
    }

    fetchData();
  }, []);

  const handleRegister = async (form: any) => {
    const result = await addEvent(form);
    if (result.ok) {
      alert("Событие добавлено");
      setErrorMessage("Событие успешно добавлено");
      return;
    }

    if (result.status === 422) {
      setErrorMessage("Ошибка в заполнении формы");
      return;
    }

    setErrorMessage(null);
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    handleRegister(data);
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.addEventForm}>
      <div className={classnames(styles.formBlock, styles.information)}>
        <h3>Информация</h3>
        <label className={styles.input}>
          Название*
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
        <label className={styles.input}>
          Краткое описание*
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
        <label className={styles.input}>
          Полное описание*
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
        <label className={styles.input}>
          Место проведения*
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
        <label className={styles.input}>
          Возраст*
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
        <label className={styles.input}>
          Продолжительность*
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
        <label className={styles.input}>
          Дата проведения*
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
        <label className={styles.input}>
          Можно взрослым
          <input className={styles.inputArea} {...register("name", { required: true })} />
        </label>
      </div>
      <div className={styles.formBlock}><h3>Партнер</h3>
        <div className={styles.partners}>

        </div>
      </div>
      {//<div className={styles.formBlock}><h3>Добавить слот</h3><SlotsForm form={getValues()} onChange={handleFormChange} /></div>
      }

      {
        errorMessage ? (
          <h6
            className={"text-danger"}
            style={{ textAlign: "center", padding: 10 }}
          >
            {errorMessage}
          </h6>
        ) : (
          <></>
        )
      }
      <Button
        variant="outline-primary"
        type="submit"
        className={styles.saveButton}
        onClick={handleRegister}
      >
        Добавить
      </Button>
    </form >
  );
};
