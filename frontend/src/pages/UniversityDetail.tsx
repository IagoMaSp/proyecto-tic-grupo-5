import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import * as api from "../api";
import type { University, Review } from "../api";

import UniversityHeader from "../components/universities/UniversityHeader";
import UniversityInfo from "../components/universities/UniversityInfo";
import UniversityReviews from "../components/universities/UniversityReviews";
import UniversityPhotoGallery from "../components/universities/UniversityPhotoGallery";
import WishlistButton from "../components/universities/WishlistButton";
import { LoadingState, ErrorState } from "../components/StatusComponents";

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const hasIncremented = useRef(false);

  const [university, setUniversity] = useState<University | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
 
      try {
        setLoading(true);
        setError(null);
 
        // Lógica de incremento corregida
        // Se ejecuta solo una vez gracias al useRef
        if (!hasIncremented.current) {
          hasIncremented.current = true; // Marcar como incrementado INMEDIATAMENTE
          await api.incrementUniversityVisits(parseInt(id));
        }
 
        const [uniData, reviewsData] = await Promise.all([
          api.getUniversity(parseInt(id)),
          api.getReviews(parseInt(id)),
        ]);
 
        setUniversity(uniData);
        setReviews(reviewsData);
 
        // La lógica de sessionStorage ya no es necesaria
 
        if (isAuthenticated) {
          const inWishlist = await api.isInWishlist(parseInt(id));
          setIsInWishlist(inWishlist);
        }
 
        document.title = `${uniData.name} | UM Exchange`;
      } catch (err) {
        console.error("Error fetching university:", err);
        setError("No se pudo cargar la universidad. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, [id, isAuthenticated]);
  
  const handleWishlistToggle = async () => {
    if (!isAuthenticated || !id) return;
    try {
      if (isInWishlist) {
        await api.removeFromWishlist(parseInt(id));
        setIsInWishlist(false);
      } else {
        await api.addToWishlist(parseInt(id));
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  if (loading) {
    return (
      <section className="container">
        <div className="card">
          <LoadingState />
        </div>
      </section>
    );
  }

  if (error || !university) {
    return (
      <section className="container">
        <div className="card">
          <ErrorState
            message={error || "Universidad no encontrada"}
            onRetry={() => navigate("/universities")}
          />
        </div>
      </section>
    );
  }

  const showRating = university.overall_avg_rating && university.overall_avg_rating > 0;

  return (
    <section className="university-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Inicio</Link>
          <span className="breadcrumb-separator">›</span>
          <Link to="/universities" className="breadcrumb-link">Universidades</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{university.name}</span>
        </nav>
      </div>

      <UniversityHeader university={university} />

      <div className="container">
        <div className="university-detail-grid">
          <div className="university-main-col">
            <UniversityInfo university={university} />
            <UniversityPhotoGallery university={university} />
            <UniversityReviews reviews={reviews} universityName={university.name} />
          </div>

          <aside className="university-sidebar">
            <WishlistButton
              isInWishlist={isInWishlist}
              isAuthenticated={isAuthenticated}
              onToggle={handleWishlistToggle}
            />

            <div className="quick-stats-card">
              <h3 className="quick-stats-title">Estadísticas</h3>
              <div className="quick-stats-list">
                <div className="quick-stat">
                  <span className="quick-stat-icon">🏆</span>
                  <div>
                    <div className="quick-stat-label">Ranking QS</div>
                    <div className="quick-stat-value">
                      {university.qs_rating_top}
                      {university.qs_rating_bottom !== university.qs_rating_top && ` - ${university.qs_rating_bottom}`}
                    </div>
                  </div>
                </div>

                <div className="quick-stat">
                  <span className="quick-stat-icon">⭐</span>
                  <div>
                    <div className="quick-stat-label">Valoración</div>
                    <div className="quick-stat-value">
                      {showRating ? `${university.overall_avg_rating!.toFixed(1)}/5` : "—"}
                    </div>
                  </div>
                </div>

                <div className="quick-stat">
                  <span className="quick-stat-icon">📝</span>
                  <div>
                    <div className="quick-stat-label">Reviews</div>
                    <div className="quick-stat-value">{reviews.length}</div>
                  </div>
                </div>

                <div className="quick-stat">
                  <span className="quick-stat-icon">👁️</span>
                  <div>
                    <div className="quick-stat-label">Visitas</div>
                    <div className="quick-stat-value">{university.visits_count}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-cta">
              <h4 className="sidebar-cta-title">¿Querés comparar?</h4>
              <p className="sidebar-cta-text">
                Agregá hasta 3 universidades y comparalas lado a lado
              </p>
              <Link to={`/compare?ids=${id}`} className="btn primary full-width">
                Comparar universidades
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}