import Container from "react-bootstrap/Container";

function Carousel() {
  return (
    <Container className="carousel">
      <input type="radio" name="slider" id="item-1" defaultChecked={true} />
      <input type="radio" name="slider" id="item-2" />
      <input type="radio" name="slider" id="item-3" />
      <input type="radio" name="slider" id="item-4" />
      <input type="radio" name="slider" id="item-5" />
      <input type="radio" name="slider" id="item-6" />
      <input type="radio" name="slider" id="item-7" />
      <input type="radio" name="slider" id="item-8" />
      <input type="radio" name="slider" id="item-9" />
      <input type="radio" name="slider" id="item-10" />
      <div className="cards">
        <label className="card" htmlFor="item-1" id="photo-1">
          <img src={require("shared/image/2022/1.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-2" id="photo-2">
          <img src={require("shared/image/2022/2.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-3" id="photo-3">
          <img src={require("shared/image/2022/3.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-4" id="photo-4">
          <img src={require("shared/image/2022/4.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-5" id="photo-5">
          <img src={require("shared/image/2022/5.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-6" id="photo-6">
          <img src={require("shared/image/2022/6.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-7" id="photo-7">
          <img src={require("shared/image/2022/7.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-8" id="photo-8">
          <img src={require("shared/image/2022/8.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-9" id="photo-9">
          <img src={require("shared/image/2022/9.jpeg")} alt="дни космоса 2022" />
        </label>
        <label className="card" htmlFor="item-10" id="photo-10">
          <img src={require("shared/image/2022/10.jpeg")} alt="дни космоса 2022" />
        </label>
      </div>
    </Container>
  );
}

export default Carousel;
