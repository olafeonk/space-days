import Container from "react-bootstrap/Container";

const Loader = () => (
  <Container className="loader">
    <svg class="solar-system" width="200" height="200">
      <circle id="sun" cx="100" cy="100" r="16" stroke="none" fill="#FFE581" />

      <circle
        id="mercury"
        cx="100"
        cy="100"
        r="3"
        fill="#5e7fd6"
        stroke="none"
      />

      <circle id="venus" cx="100" cy="100" r="4" fill="#5e7fd6" stroke="none" />

      <circle id="earth" cx="100" cy="100" r="5" fill="#5e7fd6" stroke="none" />

      <circle id="mars" cx="100" cy="100" r="5" fill="#5e7fd6" stroke="none" />

      <circle
        id="mercury-orbit"
        cx="100"
        cy="100"
        r="35"
        fill="none"
        stroke="#5e7ed64d"
        stroke-width="0.5"
      />

      <circle
        id="venus-orbit"
        cx="100"
        cy="100"
        r="55"
        fill="none"
        stroke="#5e7ed64d"
        stroke-width="0.5"
      />

      <circle
        id="earth-orbit"
        cx="100"
        cy="100"
        r="75"
        fill="none"
        stroke="#5e7ed64d"
        stroke-width="0.5"
      />

      <circle
        id="mars-orbit"
        cx="100"
        cy="100"
        r="95"
        fill="none"
        stroke="#5e7ed64d"
        stroke-width="0.5"
      />
    </svg>
  </Container>
);

export default Loader;
