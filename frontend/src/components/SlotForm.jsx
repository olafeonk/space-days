import { Container } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const ChildForm = ({ child, onChange }) => (
  <Container className="p-0">
    <Form.Group controlId="startTime">
      <Form.Label>Время начала</Form.Label>
      <Form.Control
        type="text"
        className="rounded"
        value={child.start_time}
        onChange={(event) =>
          onChange({ ...child, start_time: event.target.value })
        }
        required
      />
    </Form.Group>
    <Form.Group className="mb-5" controlId="amount">
      <Form.Label>Количество мест</Form.Label>
      <Form.Control
        type="number"
        className="rounded"
        value={child.amount}
        onChange={(event) => onChange({ ...child, amount: event.target.value })}
        required
      />
    </Form.Group>
  </Container>
);

export default ChildForm;
