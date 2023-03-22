export default function InfoBlock(props) {
  const { info } = props;
  return (
    <div>
      <h2>{info.count}</h2>
      <span>{info.item}</span>
    </div>
  );
}
