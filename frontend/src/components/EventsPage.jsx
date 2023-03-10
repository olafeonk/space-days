import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { LinkContainer } from 'react-router-bootstrap';


const EventsPage = () => (
    <Container>
      <ButtonToolbar className="custom-btn-toolbar">
        <LinkContainer to="/">
          <Button>Home</Button>
        </LinkContainer>
        <LinkContainer to="/events">
          <Button>Events</Button>
        </LinkContainer>
      </ButtonToolbar>
      <hr/>
      Events
      <Button>Press me</Button>
    </Container>
  );

export default EventsPage;
