import { Link } from "react-router-dom";
import type { University } from "../../api";

/**
 * Componente para mostrar la tarjeta de una universidad.
 */
export default function UniversityCard({ university, index }: { university: University; index: number }) {
  return (
    <Link 
      to={`/universities/${university.id}`} 
      className="university-card" 
      // La animación escalonada es un buen detalle
      style={{ animationDelay: `${index * 0.05}s`, textDecoration: 'none', color: 'inherit' }}
    >
      <h3 className="uni-name">{university.name}</h3>
      <div className="uni-country">
        <span>📍</span>
        {university.country}
      </div>
      <div className="uni-stats">
        <div className="uni-stat">
          <span className="uni-stat-label">Ranking QS</span>
          <span className="uni-ranking-badge">
            {university.qs_rating_top}
            {/* Mostrar rango si existe */}
            {university.qs_rating_bottom !== university.qs_rating_top && ` - ${university.qs_rating_bottom}`}
          </span>
        </div>
      </div>
    </Link>
  );
}