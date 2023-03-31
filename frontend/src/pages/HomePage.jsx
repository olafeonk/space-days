import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { LinkContainer } from "react-router-bootstrap";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Carousel from "../components/Carousel";
import InfoList from "../components/InfoInNumbers/InfoList";
import info from "../components/InfoInNumbers/infoObj";
import PartnerCarousel from "../components/PartnerCarousel";

const HomePage = () => (
  <Container>
    <Header></Header>
    <Container fluid>
      <Row className="banner">
        <Col
          className="d-flex flex-column justify-content-center"
          xl={6}
          lg={5}
        >
          <h1>Дни космоса 2023</h1>
          <p>94 бесплатных мероприятия за 8 дней + большое открытие</p>
          <Button
            variant="outline-primary"
            className="rounded-pill align-self-start"
          >
            Зарегистрироваться
          </Button>
        </Col>
        <Col
          className="d-flex justify-content-center align-items-center"
          xl={5}
          lg={5}
        >
          <Image fluid rounded src="./image/banner_pic.png"></Image>
        </Col>
        <Col>
          <Button
            variant="outline-primary"
            className="rounded-pill align-self-start hidden"
          >
            Зарегистрироваться
          </Button>
        </Col>
      </Row>
      <Row className="about justify-content-center align-items-center" md={4}>
        <InfoList info={info} />
      </Row>
      <Row className="present justify-content-center">
        <Col className="d-flex justify-content-center align-items-center">
          <Image fluid rounded src="./image/present.png"></Image>
        </Col>
        <Col className="d-flex flex-column justify-content-center">
          <h2>Вас ждут подарки!</h2>
          <p>
            Получи на открытии или распечатай <a href="#">флаер</a>
            <br />
            <br />
            Посещай мероприятия на неделе с 8 по 16 апреля
            <br />
            <br />
            Собери не менее 5 наклеек
            <br />
            <br />
            Обменяй флаер на призы в Школе Астрономии kantrSkrip
          </p>
        </Col>
      </Row>
      <Row className="map justify-content-between">
        <h2>Этапы мероприятия</h2>
        <Col className="map__steps" md={12} lg={3}>
          <span>01</span>
          <Image fluid src="./image/planet_1.png"></Image>
          <h3>Расписание</h3>
          <p>
            Перейдите на страницу с{" "}
            <a href="#/events">расписанием мероприятий</a>
          </p>
        </Col>
        <Col className="map__steps" md={12} lg={3}>
          <span>02</span>
          <Image fluid src="./image/planet_2.png"></Image>
          <h3>Регистрация</h3>
          <p>Запишитесь на нужный день и время</p>
        </Col>
        <Col className="map__steps" md={12} lg={3}>
          <span>03</span>
          <Image fluid src="./image/planet_4.png"></Image>
          <h3>Мероприятия и призы</h3>
          <p>
            Посетите мероприятия и получите фишки за участие<br></br>Так у вас
            будет больше шансов выиграть призы
          </p>
        </Col>
      </Row>
      <Row className="archive justify-content-center">
        <h2>Дни Космоса 2022</h2>
        <Carousel></Carousel>
      </Row>
      <Row className="partners d-flex justify-content-center align-items-center gap-1">
        <Col className="title">
          <h2>Партнеры</h2>
        </Col>
        <Col>
          <PartnerCarousel />
        </Col>
      </Row>
      <Row className="registration d-flex justify-content-center">
        <Col>
          <Button variant="outline-primary" className="rounded-pill">
            Зарегистрироваться
          </Button>
        </Col>
      </Row>
    </Container>
    <Footer></Footer>
  </Container>
);

export default HomePage;
