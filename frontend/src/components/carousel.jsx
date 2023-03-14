import Carousel from "react-bootstrap/Carousel";

function CarouselFadeExample() {
  return (
    <Carousel fade>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://avatars.mds.yandex.net/i?id=c8d31dd9a9897445828fb10c36be8b187745f7be-9227998-images-thumbs&n=13"
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://avatars.mds.yandex.net/i?id=cc4e2f1f4f09158221743025329af4ca-5324012-images-thumbs&n=13"
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://avatars.mds.yandex.net/i?id=0c670d31502301d380aab4424e7aba789ce584ad-8187767-images-thumbs&n=13"
          alt="Third slide"
        />
      </Carousel.Item>
    </Carousel>
  );
}

export default CarouselFadeExample;
