import type { Review } from "../../api";
import ReviewCard from "../reviews/ReviewCard"; 

interface UserReviewsListProps {
  reviews: Review[];
}

export default function UserReviewsList({ reviews }: UserReviewsListProps) {
  // --- PUNTO DE CONTROL 4 ---
  // Esto nos dirá qué props está recibiendo este componente.
  console.log("[UserReviewsList] Props recibidas:", reviews);

  if (reviews.length === 0) {
    console.log("[UserReviewsList] Renderizando estado vacío (length === 0).");
    return (
      <div className="empty-state">
        <h2 className="section-title mb-16">Mis Reseñas</h2>
        <p>Todavía no escribiste ninguna reseña.</p>
        <p>¡Andá a la sección de <a href="/reviews">Reseñas</a> y contá tu experiencia!</p>
      </div>
    );
  }

  console.log(`[UserReviewsList] Renderizando lista con ${reviews.length} reseñas.`);
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