import "./AdminCostumeCard.css";

export default function AdminCostumeCard({ costume, onEdit, onDelete }: any) {
  const isDisabled = !costume.available;

  return (
    <div className={`admin-card ${isDisabled ? "disabled" : ""}`}>
      <div className="image-wrapper">
        <img src={costume.photos?.[0]} alt={costume.title} />
        {isDisabled && <div className="overlay">🚫 Недоступен</div>}
      </div>

      <div className="card-body">
        <h4>{costume.title}</h4>
        <p>{costume.price} ₽</p>
        <p className="sizes">Размеры: {costume.sizes?.join(", ")}</p>

        <div className="buttons">
          <button onClick={onEdit}>✏️</button>
          <button onClick={onDelete}>🗑️</button>
        </div>
      </div>
    </div>
  );
}
