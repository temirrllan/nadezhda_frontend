interface CostumeCardProps {
  costume: any;
  onClick: () => void;
}

export default function CostumeCard({ costume, onClick }: CostumeCardProps) {
  return (
    <div className="costume-card" onClick={onClick}>
      <img
        src={costume.photos?.[0] || "https://via.placeholder.com/300x400?text=No+Image"}
        alt={costume.title}
      />
      <div className="card-info">
        <h3>{costume.title}</h3>
        <p>{costume.price} ₽</p>
      </div>
    </div>
  );
}
