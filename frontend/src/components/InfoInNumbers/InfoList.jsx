import InfoBlock from "./InfoBlock";

export default function InfoList({ info }) {
  const infoElements = info.map((info, index) => (
    <InfoBlock info={info} key={index} />
  ));
  return infoElements;
}
