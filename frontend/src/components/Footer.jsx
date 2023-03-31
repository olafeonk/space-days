import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";

const Footer = () => (
  <Row className="footer justify-content-center">
    <Col md={8} lg={9}>
      <p className="bold gray">
        Мы в социальных сетях:{" "}
        <span>
          <a href="https://t.me/+BGVoanm9OLxjNzRi" className="img-link">
            <Image src="./image/tg.png" alt="telegram" />
          </a>
          <a href="https://vk.com/dnikosmosa2022" className="img-link">
            <Image src="./image/vk.png" alt="vkontakte" />
          </a>
        </span>
      </p>
      <p className="bot">
        <a href="#" className="bold">
          Телеграм-бот для проверки билетов
        </a>
      </p>
      <p>
        По всем вопросам можете писать в{" "}
        <a href="https://t.me/dni_kosmosa">телеграм-поддержку</a>
      </p>
    </Col>
    <Col>
      <p className="bold gray">Контакты</p>
      <a href="tel:+79222106000" className="tel">
        8-922-210-60-00
      </a>
    </Col>
    <Col xs={12}>
      <hr />
      <p className="copyright">© 2023 ФИИТ</p>
    </Col>
  </Row>
);

export default Footer;
