import "./Loader.css";

export default function Loader({ text = "Загрузка..." }: { text?: string }) {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner"></div>
      <p>{text}</p>
    </div>
  );
}
