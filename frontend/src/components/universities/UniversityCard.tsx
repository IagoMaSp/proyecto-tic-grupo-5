import { useState } from "react";
import { Link } from "react-router-dom";
import type { University } from "../../api";

/**
 * Componente mejorado para mostrar la tarjeta de una universidad
 * con animaciones y efectos visuales avanzados.
 */
export default function UniversityCard({ 
  university, 
  index 
}: { 
  university: University; 
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Tracking del cursor para efecto de brillo
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <Link 
      to={`/universities/${university.id}`} 
      className={`university-card ${isHovered ? 'is-hovered' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Efecto de brillo que sigue el cursor */}
      <div 
        className="university-card__glow"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />

      {/* Barra de color superior animada */}
      <div className="university-card__top-bar" />

      {/* Contenido principal */}
      <div className="university-card__content">
        {/* Header con nombre y país */}
        <div className="university-card__header">
          <h3 className="uni-name">{university.name}</h3>
          <div className="uni-country">
            <span className="uni-country__icon">📍</span>
            <span className="uni-country__text">{university.country}</span>
          </div>
        </div>

        {/* Divider animado */}
        <div className="university-card__divider" />

        {/* Estadísticas */}
        <div className="uni-stats">
          {/* Ranking QS */}
          <div className="uni-stat">
            <div className="uni-stat__label-wrapper">
              <span className="uni-stat__icon">🏆</span>
              <span className="uni-stat-label">Ranking QS</span>
            </div>
            <span className="uni-ranking-badge">
              #{university.qs_rating_top}
              {university.qs_rating_bottom !== university.qs_rating_top && 
                ` - ${university.qs_rating_bottom}`}
            </span>
          </div>

          {/* Valoración (si existe) */}
          {university.overall_avg_rating && university.overall_avg_rating > 0 && (
            <div className="uni-stat">
              <div className="uni-stat__label-wrapper">
                <span className="uni-stat__icon">⭐</span>
                <span className="uni-stat-label">Valoración</span>
              </div>
              <span className="uni-stat-value">
                {university.overall_avg_rating.toFixed(1)} / 5.0
              </span>
            </div>
          )}

          {/* Reseñas (si existen) */}
          {university.review_count && university.review_count > 0 && (
            <div className="uni-stat">
              <div className="uni-stat__label-wrapper">
                <span className="uni-stat__icon">💬</span>
                <span className="uni-stat-label">Reseñas</span>
              </div>
              <span className="uni-stat-value">
                {university.review_count}
              </span>
            </div>
          )}
        </div>

        {/* Badge flotante de continente */}
        {university.continent && (
          <div className="university-card__continent-badge">
            {university.continent}
          </div>
        )}
      </div>

      {/* Indicador de "Ver más" */}
      <div className="university-card__footer">
        <span className="university-card__cta">
          Ver detalles
          <span className="university-card__arrow">→</span>
        </span>
      </div>
    </Link>
  );
}