import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";

const Header = () => (
  <Row className="header align-items-center justify-content-between">
    <Col className="school">
      <a href="http://kantrskrip.ru/?utm_source=website&amp;utm_medium=header&amp;utm_campaign=logo">
        <Image src="https://thumb.tildacdn.com/tild6531-3631-4565-b734-613637306531/-/resize/64x/-/format/webp/__.png"></Image>
      </a>
      <a href="http://kantrskrip.ru/?utm_source=website&amp;utm_medium=header&amp;utm_campaign=logo">
        школа&nbsp;астрономии
      </a>
      <a href="https://kantrskrip.ru/about">О&nbsp;школе</a>
    </Col>
    <div className="vertical-hr"></div>
    <Col className="hochu-v-nauku">
      <a href="http://kantrskrip.ru/?utm_source=website&amp;utm_medium=header&amp;utm_campaign=logo">
        <Image src="./image/partners/hochuvnauku-simple.png"></Image>
      </a>
      <a href="https://vnauku.ru/">хочу&nbsp;в&nbsp;науку</a>
      <a href="https://vnauku.ru/">О&nbsp;фонде</a>
    </Col>
    <div className="vertical-hr"></div>
    <Col className="molodeznaya">
      <a href="http://kantrskrip.ru/?utm_source=website&amp;utm_medium=header&amp;utm_campaign=logo">
        <Image src="./image/partners/molodeznayapolicy-simple.png"></Image>
      </a>
      <a href="http://молодежь.екатеринбург.рф">
        Управление&nbsp;молодёжной&nbsp;политики
        администрации&nbsp;города&nbsp;Екатеринбурга
      </a>
      <a href="http://молодежь.екатеринбург.рф/управление-молодежной-политики/управление">
        О&nbsp;департаменте
      </a>
    </Col>
  </Row>
);

export default Header;
