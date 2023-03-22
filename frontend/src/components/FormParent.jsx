import { Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const FormChild = () => (
  <Container className="p-0">
    <Form.Group className="mb-3" controlId="formLastName">
      <Form.Label>Фамилия</Form.Label>
      <Form.Control type="text" className="rounded-pill" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formFirstName">
      <Form.Label>Имя</Form.Label>
      <Form.Control type="text" className="rounded-pill" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formBirthday">
      <Form.Label>Дата рождения</Form.Label>
      <Form.Control type="date" className="rounded-pill" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formPhone">
      <Form.Label>Телефон</Form.Label>
      <Form.Control type="tel" className="rounded-pill" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formEmail">
      <Form.Label>Почта</Form.Label>
      <Form.Control type="email" className="rounded-pill" />
    </Form.Group>
    <Form.Group className="mb-3" controlId="formCheckbox">
      <Form.Check type="checkbox" label="Есть ребенок/дети" />
    </Form.Group>
  </Container>
);

export default FormChild;
