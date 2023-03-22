import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { LinkContainer } from "react-router-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Form from "react-bootstrap/Form";
import FormChild from "../components/FormChild";
import FormParent from "../components/FormParent";

const Registration = () => (
  <Container>
    <ButtonToolbar className="custom-btn-toolbar">
      <LinkContainer to="/">
        <Button>Home</Button>
      </LinkContainer>
      <LinkContainer to="/events">
        <Button>Events</Button>
      </LinkContainer>
      <LinkContainer to="/registration">
        <Button>Registration</Button>
      </LinkContainer>
    </ButtonToolbar>
    <Row>
      <Col>
        <p>Правила</p>
      </Col>
    </Row>
    <Row>
      <Col>
        <Form>
          <p className="text-muted mb-0">Взрослый</p>
          <hr className="text-muted mt-0" />
          <FormParent />
          <p className="text-muted mb-0">Ребенок 1</p>
          <hr className="text-muted mt-0" />
          <FormChild />
          <Button variant="light" className="rounded-circle m-auto">
            +
          </Button>
        </Form>
      </Col>
      <Col>
        <h1>Мероприятие</h1>
        <p>Описание</p>
        <Image fluid rounded src="./logo512.png"></Image>
      </Col>
    </Row>
    <Row>
      <Col>
        <Button
          variant="secondary"
          type="submit"
          className="rounded-pill d-flex flex-column justify-content-center align-items-center w-100"
        >
          Зарегистрироваться
        </Button>
      </Col>
    </Row>
    <Row>
      <Col className="d-flex flex-column justify-content-center align-items-center w-100">
        <p>
          Нажимая кнопку, вы соглашаетесь с{" "}
          <a href="#">Политикой конфиденциальности</a> и
          <a href="#">Пользовательским соглашением</a>.
        </p>
      </Col>
    </Row>
  </Container>
);

export default Registration;
