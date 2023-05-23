import React, { useState, useCallback } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import partnersLinks from "../partnersLinks";
import AddEventForm from "../components/AddEventForm";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import Error from "../components/Error";

const STATUS_PAGE_ERROR = -1;
const STATUS_ADDFORM_VALIDATION_ERROR = 4;
const STATUS_ADDFORM_LOADING = 2;
const STATUS_ADDFORM_LOADED = 3;
const STATUS_ADDFORM_START = 5;

const AddEventPage = () => {
  const savedSearchForm = tryLoadSearchForm();

  const [form, setForm] = useState({
    partnerId: (savedSearchForm && savedSearchForm.partnerId) || "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [status, setStatus] = useState(STATUS_ADDFORM_START);
  const [validated, setValidated] = useState(false);

  const handleFormChange = useCallback((f) => {
    setForm(f);
  }, []);

  function renderError() {
    return <Error />;
  }

  function checkFormFilled(form) {
    const { partnerId } = form;

    if (partnerId && partnerId.length > 0) {
      return true;
    }

    return false;
  }

  function renderForm(form, status, handleFormChange, handleShowTickets) {
    const submitDisabled =
      !checkFormFilled(form) || status === STATUS_ADDFORM_LOADING;

    return (
      <Form
        className="tickets-page__form"
        style={{
          flexDirection: "column",
          rowGap: 20,
          alignItems: "normal",
          position: "relative",
        }}
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
      >
        <Form.Group controlId="formBirthday">
          <Form.Label>ID партнера</Form.Label>
          <Form.Control
            type="text"
            className="rounded"
            value={form.partnerId}
            onChange={(event) =>
              handleFormChange({ ...form, partnerId: event.target.value })
            }
            required
            pattern="{2,}"
            style={{ margin: 0 }}
          />
          <Form.Control.Feedback type="invalid">
            Введите ваш ID партнера
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={submitDisabled}
          variant="outline-primary"
          type="submit"
          className="rounded d-flex flex-column justify-content-center align-items-center"
          style={{ margin: 0 }}
        >
          Добавить событие
        </Button>
        {errorMessage ? (
          <h6
            className={"text-danger"}
            style={{ textAlign: "center", padding: 10 }}
          >
            {errorMessage}
          </h6>
        ) : (
          <></>
        )}
      </Form>
    );
  }

  function tryLoadSearchForm() {
    try {
      const registrationFormString = window.localStorage.getItem("form");
      const registrationForm = registrationFormString
        ? JSON.parse(registrationFormString)
        : null;

      const searchFormString = window.localStorage.getItem("searchForm");
      const searchForm = searchFormString ? JSON.parse(searchFormString) : null;

      return searchForm || registrationForm;
    } catch {
      return null;
    }
  }

  const handleSubmit = (event) => {
    setStatus(STATUS_ADDFORM_LOADING);
    const formCheck = event.currentTarget;
    if (!formCheck.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      setStatus(STATUS_ADDFORM_VALIDATION_ERROR);
    }
    setValidated(true);
    if (formCheck.checkValidity()) {
      if (form.partnerId in partnersLinks) {
        setErrorMessage(null);
        setStatus(STATUS_ADDFORM_LOADED);
        saveSearchForm(form);
        return;
      }

      setErrorMessage(
        "Ваш ID партнера не найден. Проверьте корректность ввода, либо свяжитесь с организатором"
      );
      setStatus(STATUS_ADDFORM_START);
      return;
    }
  };
  //   setStatus(STATUS_ADDFORM_LOADING);
  //   const formCheck = event.currentTarget;
  //   if (!formCheck.checkValidity()) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     setStatus(STATUS_ADDFORM_LOADED);
  //   }
  //   setValidated(true);
  //   if (formCheck.checkValidity()) {
  //     const result = await getMyTickets(form.phone, form.partnerId);
  //     if (result.ok) {
  //       setErrorMessage(null);
  //       setStatus(STATUS_ADDFORM_LOADED);
  //       setTickets(result.body || []);
  //       saveSearchForm(form);
  //       return;
  //     }

  //     if (result.status === 422) {
  //       setErrorMessage("Ошибка в заполнении формы");
  //       setStatus(STATUS_ADDFORM_LOADED);
  //       setTickets([]);
  //       return;
  //     }

  //     if (result.status === 404) {
  //       setErrorMessage("Пользователь не найден");
  //       setStatus(STATUS_ADDFORM_LOADED);
  //       setTickets([]);
  //       return;
  //     }

  //     setErrorMessage(null);
  //     setStatus(STATUS_PAGE_ERROR);
  //     setTickets([]);
  //   }
  // };

  function saveSearchForm(searchForm) {
    window.localStorage.setItem("searchForm", JSON.stringify(searchForm));
  }

  function renderAddEventForm() {
    return <AddEventForm partnerId={form.partnerId} />;
  }

  if (status === STATUS_PAGE_ERROR) {
    return renderError();
  }

  return (
    <Container
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header />
      <Container className="tickets-page tickets-page_with-tickets">
        {status === STATUS_ADDFORM_LOADING ? (
          <Loader />
        ) : status === STATUS_ADDFORM_LOADED ? (
          renderAddEventForm()
        ) : (
          renderForm(form, status, handleFormChange, handleSubmit)
        )}
      </Container>
      <Footer />
    </Container>
  );
};

export default AddEventPage;
