import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";

const Header = () => (
  <Row className="header align-items-center justify-content-between">
    <Col className="school-logo">
      <a href="http://kantrskrip.ru/?utm_source=website&amp;utm_medium=header&amp;utm_campaign=logo">
        <Image src="https://thumb.tildacdn.com/tild6531-3631-4565-b734-613637306531/-/resize/64x/-/format/webp/__.png"></Image>
      </a>
      <a href="http://kantrskrip.ru/?utm_source=website&amp;utm_medium=header&amp;utm_campaign=logo">
        школа астрономии
      </a>
    </Col>
    <Col>
      <a href="https://kantrskrip.ru/about">О школе</a>
    </Col>
  </Row>
);

export default Header;
