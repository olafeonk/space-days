import { Container } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";

const Error = () => {
  return (
    <Container className="error">
      <Image src="./image/error.png" alt="космонавт потерял страницу" />
      <h1>Ошибка</h1>
      <p>Ой, страница потерялась в космосе</p>
      <Link to="/">
        <Button
          variant="outline-primary"
          className="rounded-pill align-self-start"
        >
          Вернуться на главную
        </Button>
      </Link>
    </Container>
  );
};

export default Error;
