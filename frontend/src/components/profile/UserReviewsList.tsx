import type { Review } from "../../api";
import ReviewCard from "../reviews/ReviewCard"; // Reutilizamos el ReviewCard

interface UserReviewsListProps {
  reviews: Review[];
}

export default function UserReviewsList({ reviews }: UserReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="section-title mb-16">Mis Reseñas</h2>
        <p>Todavía no escribiste ninguna reseña.</p>
        <p>¡Andá a la sección de <a href="/reviews">Reviews</a> y contá tu experiencia!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title mb-24">Mis Reseñas</h2>
      <div className="reviews-list">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}