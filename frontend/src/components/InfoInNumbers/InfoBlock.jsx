import Col from "react-bootstrap/Col";

export default function InfoBlock(props) {
  const { info } = props;
  return (
    <Col xs={12} md={6} lg={4} xxl={2} className="about__item">
      <h2>{info.count}</h2>
      <span>{info.item}</span>
    </Col>
  );
}
