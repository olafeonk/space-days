import { Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const FormChild = () => (
  <Container className="p-0">
    <Form.Group className="mb-3" controlId="formLastName">
      <Form.Label>Фамилия</Form.Label>
      <Form.Control type="text" className="rounded-pill" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formLastName">
      <Form.Label>Возраст</Form.Label>
      <Form.Control type="numer" className="rounded-pill" />
    </Form.Group>
  </Container>
);

export default FormChild;
