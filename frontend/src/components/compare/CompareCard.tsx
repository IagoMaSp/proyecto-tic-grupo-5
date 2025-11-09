import { Link } from "react-router-dom";
import type { CompareUniversity } from "../../hooks/useCompareUniversities";

interface CompareCardProps {
  university: CompareUniversity;
  onRemove: (id: number) => void;
  index: number;
}

export default function CompareCard({ university, onRemove, index }: CompareCardProps) {
  const showRatings = university.overall_avg_rating && university.overall_avg_rating > 0;

  return (
    <div 
      className="compare-card"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <button
        className="compare-card-remove"
        onClick={() => onRemove(university.id)}
        aria-label="Remover de comparación"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="compare-card-header">
        <h3 className="compare-card-title">{university.name}</h3>
        <div className="compare-card-country">📍 {university.country}</div>
      </div>

      <div className="compare-card-body">
        <div className="compare-card-metrics">
        <div className="compare-metric">
          <div className="compare-metric-label">Ranking QS</div>
          <div className="compare-metric-value compare-metric-qs">
            {university.qs_rating_top}
            {university.qs_rating_bottom !== university.qs_rating_top && 
              ` - ${university.qs_rating_bottom}`}
          </div>
        </div>

        <div className="compare-metric">
          <div className="compare-metric-label">Reviews</div>
          <div className="compare-metric-value">
            {university.review_count || 0}
          </div>
        </div>

        {showRatings && (
          <>
            <div className="compare-metric">
              <div className="compare-metric-label">Valoración General</div>
              <div className="compare-metric-value compare-metric-rating">
                ⭐ {university.overall_avg_rating!.toFixed(1)}
              </div>
            </div>

            <div className="compare-metric">
              <div className="compare-metric-label">Social</div>
              <div className="compare-metric-value">
                {university.avg_social ? university.avg_social.toFixed(1) : "—"} / 5.0
              </div>
            </div>

            <div className="compare-metric">
              <div className="compare-metric-label">Académico</div>
              <div className="compare-metric-value">
                {university.avg_academic ? university.avg_academic.toFixed(1) : "—"} / 5.0
              </div>
            </div>

            <div className="compare-metric">
              <div className="compare-metric-label">Lugar</div>
              <div className="compare-metric-value">
                {university.avg_place ? university.avg_place.toFixed(1) : "—"} / 5.0
              </div>
            </div>
          </>
        )}
      </div>

      {university.latestReviews.length > 0 && (
        <div className="compare-card-reviews">
          <div className="compare-reviews-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Últimas reseñas</span>
          </div>
          <div className="compare-reviews-list">
            {university.latestReviews.map((review) => (
              <div key={review.id} className="compare-review-item">
                <div className="compare-review-rating">
                  ⭐ {review.overall_rating.toFixed(1)}
                </div>
                <div className="compare-review-text">
                  {review.description.length > 100
                    ? `${review.description.slice(0, 100)}...`
                    : review.description}
                </div>
                <div className="compare-review-author">
                  — {review.username || "Anónimo"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link 
        to={`/universities/${university.id}`}
        className="btn ghost full-width"
      >
        Ver detalles completos
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </Link>
    </div>
    </div>
  );
}