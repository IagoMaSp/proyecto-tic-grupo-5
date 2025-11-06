import type { Review } from "../../api.ts";

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          {/* Fallback por si 'university_name' es opcional */}
          <h4 className="review-uni-name">{review.university_name || "Universidad"}</h4>
          <p className="review-user-date">
            {/* Fallback por si 'username' es opcional */}
            Por <strong>{review.username || "Anónimo"}</strong> | {formatDate(review.start_date)} -{" "}
            {formatDate(review.end_date)}
          </p>
        </div>
        <div className="review-overall-rating">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>{review.overall_rating.toFixed(1)}</span>
        </div>
      </div>
      <p className="review-description">{review.description}</p>
      <div className="review-ratings-grid">
        <div className="review-rating-item">
          <span className="review-rating-label">Social</span>
          <span className="review-rating-value">
            {review.social_rating.toFixed(1)} / 5.0
          </span>
        </div>
        <div className="review-rating-item">
          <span className="review-rating-label">Académico</span>
          <span className="review-rating-value">
            {review.academic_rating.toFixed(1)} / 5.0
          </span>
        </div>
        <div className="review-rating-item">
          <span className="review-rating-label">Lugar/Ciudad</span>
          <span className="review-rating-value">
            {review.place_rating.toFixed(1)} / 5.0
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;