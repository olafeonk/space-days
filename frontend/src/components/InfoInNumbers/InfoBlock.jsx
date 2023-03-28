export default function InfoBlock(props) {
  const { info } = props;
  return (
    <div className="about__item">
      <h2>{info.count}</h2>
      <span>{info.item}</span>
    </div>
  );
}
