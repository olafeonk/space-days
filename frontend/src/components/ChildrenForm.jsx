import React from "react";
import Button from "react-bootstrap/Button";
import ChildForm from "../components/ChildForm";

const ChildrenForm = ({ form, onChange }) => {
  const handleAddChild = () => {
    const newChildren = [
      ...form.children,
      {
        name: "",
        age: "",
      },
    ];
    const newForm = {
      ...form,
      children: newChildren,
    };
    onChange(newForm);
  };

  const handleChildChanged = (child, index) => {
    const newChildren = form.children.map((it, i) =>
      i === index ? child : it
    );
    const newForm = {
      ...form,
      children: newChildren,
    };
    onChange(newForm);
  };

  return (
    <>
      {form.children.map((child, index) => (
        <>
          <p className="text-muted mb-0">Ребенок {index + 1}</p>
          <hr className="text-muted mt-0" />
          <ChildForm
            child={child}
            onChange={(value) => handleChildChanged(value, index)}
          />
        </>
      ))}
      {form.children.length < 3 && (
        <Button
          variant="outline-primary"
          className="add-child-button rounded-circle d-flex m-auto border"
          onClick={handleAddChild}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 1L16 31"
              stroke="#A4A4A4"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M1 16H31"
              stroke="#A4A4A4"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </Button>
      )}
    </>
  );
};

export default ChildrenForm;
