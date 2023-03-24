import { Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const ChildForm = ({ child, onChange }) => (
  <Container className="p-0">
    <Form.Group className="mb-3" controlId="formLastName">
      <Form.Label>Имя</Form.Label>
      <Form.Control
        type="text"
        className="rounded-pill"
        value={child.name}
        onChange={(event) => onChange({ ...child, name: event.target.value })}
      />
    </Form.Group>
    <Form.Group className="mb-5" controlId="formLastName">
      <Form.Label>Возраст</Form.Label>
      <Form.Control
        type="number"
        className="rounded-pill"
        value={child.age}
        onChange={(event) => onChange({ ...child, age: event.target.value })}
      />
    </Form.Group>
  </Container>
);

export default ChildForm;
