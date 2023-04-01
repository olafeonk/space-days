import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Image from "react-bootstrap/Image";

const Footer = () => (
  <Row className="footer justify-content-center">
    <Col>
      <p className="bold gray">
        Мы в социальных сетях:{" "}
        <span>
          <a href="https://t.me/+BGVoanm9OLxjNzRi" className="img-link">
            <Image src="./image/tg.png" alt="telegram" />
          </a>
          <a href="https://vk.com/dnikosmosa2023" className="img-link">
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
    <Col xs={12}>
      <hr />
      <p className="copyright">© 2023 ФИИТ</p>
    </Col>
  </Row>
);

export default Footer;
