import React, { useState, useCallback, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { padTime, pluralize, convertDate, convertTime } from "../core";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import Error from "../components/Error";
import { getMyTickets } from "../apis/backend";

const STATUS_PAGE_ERROR = -1;
const STATUS_TICKETS_LOADING = 2;
const STATUS_TICKETS_LOADED = 3;

const AddEventPage = () => {
  const savedSearchForm = tryLoadSearchForm();

  const [form, setForm] = useState({
    phone: (savedSearchForm && savedSearchForm.phone) || "",
    partnerId: (savedSearchForm && savedSearchForm.partnerId) || "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [status, setStatus] = useState(STATUS_TICKETS_LOADED);
  const [tickets, setTickets] = useState([]);

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
      !checkFormFilled(form) || status === STATUS_TICKETS_LOADING;

    return (
      <Form
        className="tickets-page__form"
        style={{ flexDirection: "column", rowGap: 0, alignItems: "normal" }}
      >
        <Form.Group controlId="formBirthday">
          <Form.Label>ID партнера</Form.Label>
          <Form.Control
            type="text"
            className="rounded"
            value={form.partnerId}
            title="aaaa"
            onChange={(event) =>
              handleFormChange({ ...form, partnerId: event.target.value })
            }
            required
            pattern="^[A-Za-z\s]{2,}"
          />
        </Form.Group>
        <Button
          disabled={submitDisabled}
          variant="outline-primary"
          type="submit"
          className="rounded d-flex flex-column justify-content-center align-items-center"
          onClick={handleShowTickets}
          style={{ margin: 0 }}
        >
          Добавить событие
        </Button>
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

  const handleSubmit = async () => {
    setStatus(STATUS_TICKETS_LOADING);
    const result = await getMyTickets(form.phone, form.partnerId);
    if (result.ok) {
      setErrorMessage(null);
      setStatus(STATUS_TICKETS_LOADED);
      setTickets(result.body || []);
      saveSearchForm(form);
      return;
    }

    if (result.status === 422) {
      setErrorMessage("Ошибка в заполнении формы");
      setStatus(STATUS_TICKETS_LOADED);
      setTickets([]);
      return;
    }

    if (result.status === 404) {
      setErrorMessage("Пользователь не найден");
      setStatus(STATUS_TICKETS_LOADED);
      setTickets([]);
      return;
    }

    setErrorMessage(null);
    setStatus(STATUS_PAGE_ERROR);
    setTickets([]);
  };

  function saveSearchForm(searchForm) {
    window.localStorage.setItem("searchForm", JSON.stringify(searchForm));
  }

  return (
    <Container
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <Header />
      <Container className="tickets-page tickets-page_with-tickets">
        {renderForm(form, status, handleFormChange, handleSubmit)}
      </Container>
      <Footer />
    </Container>
  );
};

export default AddEventPage;
