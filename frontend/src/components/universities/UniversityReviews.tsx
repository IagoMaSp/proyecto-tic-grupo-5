import { useState } from "react";
import type { Review } from "../../api";
import ReviewCard from "../reviews/ReviewCard";

interface UniversityReviewsProps {
  reviews: Review[];
  universityName: string;
}

export default function UniversityReviews({ reviews, universityName }: UniversityReviewsProps) {
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "rating") {
      return b.overall_rating - a.overall_rating;
    }
    return b.id - a.id;
  });

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
        
        <div className="reviews-sort">
          <button
            className={`sort-btn ${sortBy === "recent" ? "active" : ""}`}
            onClick={() => setSortBy("recent")}
          >
            Más recientes
          </button>
          <button
            className={`sort-btn ${sortBy === "rating" ? "active" : ""}`}
            onClick={() => setSortBy("rating")}
          >
            Mejor valoradas
          </button>
        </div>
      </div>

      <div className="reviews-list">
        {sortedReviews.map((review, index) => (
          <div 
            key={review.id} 
            className="review-item-wrapper"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
    </div>
  );
}