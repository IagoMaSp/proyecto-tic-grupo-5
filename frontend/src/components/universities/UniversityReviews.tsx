import { useState } from "react";
import type { Review } from "../../api";
import ReviewCard from "../reviews/ReviewCard";

interface UniversityReviewsProps {
  reviews: Review[];
  universityName: string;
}

export default function UniversityReviews({ reviews, universityName }: UniversityReviewsProps) {
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");
  // Estado para paginación
  const [visibleCount, setVisibleCount] = useState(25);

  // Ordenar reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "rating") {
      return b.overall_rating - a.overall_rating;
    }
    // Por defecto, más recientes primero (asumiendo que el ID es secuencial)
    return b.id - a.id;
  });

  // Función para resetear paginación al cambiar orden y manejar "Ver más"
  const handleSortChange = (type: "recent" | "rating") => {
    setSortBy(type);
    setVisibleCount(25); // Reseteamos a 25 al cambiar el orden
  };

  if (reviews.length === 0) {
    return (
      <div className="info-card">
        <h2 className="info-card-title">Experiencias de alumnos</h2>
        <div className="empty-reviews">
          <div className="empty-reviews-icon">📝</div>
          <h3 className="empty-reviews-title">
            Aún no hay reseñas para {universityName}
          </h3>
          <p className="empty-reviews-text">
            Sé el primero en compartir tu experiencia y ayudá a otros alumnos a decidir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="info-card">
      <div className="reviews-header">
        <h2 className="info-card-title">
          Experiencias de alumnos ({reviews.length})
        </h2>
        
        {/* Sort selector */}
        <div className="reviews-sort">
          <button
            className={`sort-btn ${sortBy === "recent" ? "active" : ""}`}
            onClick={() => handleSortChange("recent")}
          >
            Más recientes
          </button>
          <button
            className={`sort-btn ${sortBy === "rating" ? "active" : ""}`}
            onClick={() => handleSortChange("rating")}
          >
            Mejor valoradas
          </button>
        </div>
      </div>

      <div className="reviews-list">
        {sortedReviews.slice(0, visibleCount).map((review, index) => (
          <div 
            key={review.id} 
            className="review-item-wrapper"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      {/* Botón Ver más mejorado */}
      {visibleCount < sortedReviews.length && (
        <div className="load-more-container">
          <button 
            onClick={() => setVisibleCount(prev => prev + 25)}
            className="btn ghost"
          >
            Ver más reseñas
          </button>
        </div>
      )}
    </div>
  );
}