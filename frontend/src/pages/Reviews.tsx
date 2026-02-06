import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext.tsx";
import * as api from "../api.ts";
import type { Review } from "../api.ts";

import NotLoggedInView from "../components/reviews/NotLoggedInView.tsx";
import ReviewForm from "../components/reviews/ReviewForm.tsx";
import ReviewCard from "../components/reviews/ReviewCard.tsx";


export default function Reviews() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Estado para controlar la cantidad de reseñas visibles
  const [visibleCount, setVisibleCount] = useState(25);

  const fetchAllReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await api.getReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    document.title = "UM Exchange | Reseñas";
    fetchAllReviews();
  }, []);

  const handleReviewCreated = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
    fetchAllReviews();
  };

  // Función para cargar más reseñas
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 25);
  };

  if (authLoading) {
    return (
      <div className="card loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <section>
      <div className="card mb-24">
        <h1 className="page-title">Experiencias de Alumnos</h1>
        <p className="subtitle">
          {isAuthenticated
            ? "Compartí tu experiencia o leé la de otros."
            : "Leé las experiencias de otros alumnos."}
        </p>

        {isAuthenticated ? (
          <ReviewForm onReviewCreated={handleReviewCreated} />
        ) : (
          <NotLoggedInView />
        )}
      </div>

      <div className="card">
        <h2 className="section-title mb-24">Reseñas Recientes</h2>
        {loadingReviews ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : reviews.length === 0 ? (
          <p>Todavía no hay reseñas. ¡Sé el primero!</p>
        ) : (
          <>
            <div className="reviews-list">
              {/* Mostramos solo las reseñas hasta visibleCount */}
              {reviews.slice(0, visibleCount).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* Botón Ver más mejorado */}
            {visibleCount < reviews.length && (
              <div className="load-more-container">
                <button 
                  onClick={handleShowMore}
                  className="btn ghost"
                >
                  Ver más reseñas
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}