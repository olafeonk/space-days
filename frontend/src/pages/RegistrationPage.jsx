import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { LinkContainer } from "react-router-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import ParentForm from "../components/ParentForm";
import { getEvent, subscribeEvent } from "../apis/backend";
import Header from "../components/Header";
import Footer from "../components/Footer";

const STATUS_LOADING = 0;
const STATUS_ERROR = -1;
const STATUS_LOADED = 1;
const STATUS_SUCCESS = 2;

// todo
// - Навести красоту + описание мероприятия
// - Добавить маску к телефону и email (браузер? на уровне React.bootstrap?)

// 1. Получаем event_id, slot_id и получаем event, находим там слот. Если чего-то нет, то Страница ошибки типа 404 (со ссылок на вернуться назад)
// 2. Прошлые даныне пользователя подтянулись из localStorage
// 3. Пользователь заполнил данные
// 4. Нажатие на кнопку отправки (тут предусмотреть проверку и ошибку)
// 5. Форматирование значений перед отправкой
// 6. Запрос на сервер, показываем страницу успеха (со ссылкой записаться еще)

const RegistrationPage = () => {
  const { status, event, slot } = useEventLoading();

  const [form, setForm] = useState({
    surname: "",
    name: "",
    birthdate: "",
    phone: "",
    email: "",
    hasChildren: false,
    children: [],
  });

  const handleFormChange = useCallback((f) => {
    setForm(f);
  }, []);

  const handleRegister = async () => {};

  switch (status) {
    case STATUS_LOADING:
      return renderLoading();
    case STATUS_LOADED:
      return renderLoaded(form, handleFormChange, handleRegister);
    case STATUS_SUCCESS:
      return renderSuccess();
    default:
      return renderError();
  }
};

function renderLoading() {
  return <h1 style={{textAlign: "center"}}>Загрузка</h1>;
}

function renderLoaded(form, handleFormChange, handleRegister) {
  return (
    <Container>
      <Header />
      <Row>
        <Col>
          <p>Правила</p>
        </Col>
      </Row>
      <Row>
        <Col className="registration-form">
          <ParentForm form={form} onChange={handleFormChange} />
        </Col>
        <Col>
          <h1>Мероприятие</h1>
          <p>Описание</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            variant="outline-primary"
            type="submit"
            className="rounded-pill d-flex flex-column justify-content-center align-items-center w-100"
            onClick={handleRegister}
          >
            Зарегистрироваться
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex flex-column justify-content-center align-items-center w-100">
          <p>
            Нажимая кнопку, вы соглашаетесь с{" "}
            <a href="#">Политикой конфиденциальности</a> и{" "}
            <a href="#">Пользовательским соглашением</a>.
          </p>
        </Col>
      </Row>
      <Footer />
    </Container>
  );
}

function renderSuccess() {
  return <h1 style={{textAlign: "center"}}>Успех</h1>;
}

function renderError() {
  return <h1 style={{textAlign: "center"}}>Ошибка</h1>;
}

function useEventLoading() {
  const { search } = useLocation();
  const query = React.useMemo(() => new URLSearchParams(search), [search]);
  const [status, setStatus] = useState(STATUS_LOADING);
  const [eventAndSlot, setEventAndSlot] = useState({ event: null, slot: null });

  useEffect(() => {
    async function run() {
      const eventId = parseInt(query.get("eventId"), 10);
      const slotId = parseInt(query.get("slotId"), 10);

      const events = (await getEvent(eventId)) || [];
      const event = events[0];
      if (!event) {
        setStatus(STATUS_ERROR);
        return;
      }

      const slot = event.slots.filter((s) => s.slot_id === slotId)[0];
      if (!slot) {
        setStatus(STATUS_ERROR);
        return;
      }

      setEventAndSlot({ event, slot });
      setStatus(STATUS_LOADED);
    }

    run();
  }, [query]);

  return { status, event: eventAndSlot.event, slot: eventAndSlot.slot };
}

export default RegistrationPage;
