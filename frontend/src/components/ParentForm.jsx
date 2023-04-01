import React from "react";
import Form from "react-bootstrap/Form";
import ChildrenForm from "../components/ChildrenForm";

const ParentForm = ({ form, onChange }) => {
  return (
    <Form>
      <p className="text-muted mb-0">Взрослый</p>
      <hr className="text-muted mt-0" />
      <Form.Group controlId="formLastName">
        <Form.Label>Фамилия</Form.Label>
        <Form.Control
          type="text"
          className="rounded"
          value={form.surname}
          onChange={(event) =>
            onChange({ ...form, surname: event.target.value })
          }
        />
      </Form.Group>
      <Form.Group controlId="formFirstName">
        <Form.Label>Имя</Form.Label>
        <Form.Control
          type="text"
          className="rounded"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
        />
      </Form.Group>
      <Form.Group controlId="formBirthday">
        <Form.Label>Дата рождения</Form.Label>
        <Form.Control
          type="date"
          className="rounded"
          value={form.birthdate}
          onChange={(event) =>
            onChange({ ...form, birthdate: event.target.value })
          }
        />
      </Form.Group>
      <Form.Group controlId="formPhone">
        <Form.Label>Телефон</Form.Label>
        <Form.Control
          type="tel"
          className="rounded"
          value={form.phone}
          onChange={(event) => onChange({ ...form, phone: event.target.value })}
        />
      </Form.Group>
      <Form.Group controlId="formEmail">
        <Form.Label>Почта</Form.Label>
        <Form.Control
          type="email"
          className="rounded"
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
        />
      </Form.Group>
      <Form.Group controlId="formCheckbox">
        <Form.Check
          type="checkbox"
          className="mb-5"
          label="Есть ребенок/дети"
          checked={form.hasChildren}
          onChange={(event) =>
            onChange({ ...form, hasChildren: event.target.checked })
          }
        />
        {form.hasChildren && <ChildrenForm form={form} onChange={onChange} />}
      </Form.Group>
    </Form>
  );
};

export default React.memo(ParentForm);
