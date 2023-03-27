import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { LinkContainer } from "react-router-bootstrap";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import CarouselFadeExample from "../components/Carousel";
import Form from "react-bootstrap/Form";
import InfoList from "../components/InfoInNumbers/InfoList";
import info from "../components/InfoInNumbers/infoObj";

const HomePage = () => (
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
    <Header></Header>
    <Container fluid>
      <Row className="banner no-gutters">
        <Col className="d-flex flex-column justify-content-around">
          <h1>Заголовок</h1>
          <p>Какое-то описание</p>
          <Button
            variant="secondary"
            className="rounded-pill align-self-center"
          >
            Зарегистрироваться
          </Button>
        </Col>
        <Col className="d-flex justify-content-center align-items-center">
          <Image fluid rounded src="./logo512.png"></Image>
        </Col>
      </Row>
      <Row className="about justify-content-between align-items-center" md={4}>
        <Col>
          <InfoList info={info} />
        </Col>
      </Row>
      <Row className="present">
        <Row>
          <Col className="d-flex justify-content-center align-items-center">
            <Image fluid rounded src="./logo512.png"></Image>
          </Col>
          <Col className="d-flex flex-column justify-content-between align-items-center">
            <h1>Заголовок</h1>
            <p>Какое-то описание</p>
            <Button variant="secondary" className="rounded-pill">
              Подробнее
            </Button>
          </Col>
        </Row>
      </Row>
      <Row className="map position-relative justify-content-center">
        <h2>Этапы мероприятия</h2>
        <Container className="map__steps">
          <Container className="position-absolute first">
            <span>01</span>
            <Col>
              <Image fluid src="./logo512.png"></Image>
              <h3>Расписание</h3>
              <p>
                Перейдите на страницу с <a href="#">расписанием мероприятий</a>
              </p>
            </Col>
          </Container>
          <Container className="position-absolute second">
            <span>02</span>
            <Col>
              <Image fluid src="./logo512.png"></Image>
              <h3>Регистрация</h3>
              <p>Запишитесь на нужный день и время</p>
            </Col>
          </Container>
          <Container className="position-absolute third">
            <span>03</span>
            <Col>
              <Image fluid src="./logo512.png"></Image>
              <h3>Рассылка</h3>
              <p>
                <a href="#">Подпишитесь на уведомления</a>, чтобы не пропустить
                мероприятия
              </p>
            </Col>
          </Container>
          <Container className="position-absolute fourth">
            <span>04</span>
            <Col>
              <Image fluid src="./logo512.png"></Image>
              <h3>Мероприятия и призы</h3>
              <p>
                Посетите мероприятия и получите фишки за участие<br></br>Так у
                вас будет больше шансов выиграть призы
              </p>
            </Col>
          </Container>
        </Container>
      </Row>
      <Row className="archive justify-content-center">
        <h2>Архив</h2>
        <CarouselFadeExample></CarouselFadeExample>
      </Row>
      <Row className="partners d-flex justify-content-center align-items-center gap-3">
        <h2>Партнеры</h2>
        <Row className="justify-content-around">
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
        </Row>
        <Row className="justify-content-around">
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
          <Image roundedCircle src="./logo512.png"></Image>
        </Row>
      </Row>
      <Row className="registration d-flex justify-content-center">
        <Button variant="secondary" className="rounded-pill">
          Зарегистрироваться
        </Button>
      </Row>
      <Row className="newsletter justify-content-center">
        <h2>Рассылка</h2>
        <Form className="d-flex flex-column justify-content-center align-items-center">
          <p>Описание</p>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              type="email"
              placeholder="Почта"
              className="rounded-pill"
            />
          </Form.Group>
          <Button variant="secondary" type="submit" className="rounded-pill">
            Подписаться
          </Button>
        </Form>
      </Row>
    </Container>
    <Footer></Footer>
  </Container>
);

export default HomePage;
