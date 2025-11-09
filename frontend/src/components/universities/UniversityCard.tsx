import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import type { University } from "../../api.ts";
import { useAuth } from "../../contexts/authContext.tsx";
import * as api from "../../api.ts";

interface UniversityCardProps {
  university: University;
  index: number;
  isInWishlist: boolean;
  onToggleWishlist: (universityId: number) => void;
}

export default function UniversityCard({
  university,
  index,
  isInWishlist,
  onToggleWishlist,
}: UniversityCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await api.removeFromWishlist(university.id);
      } else {
        await api.addToWishlist(university.id);
      }
      onToggleWishlist(university.id);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link 
      to={`/universities/${university.id}`} 
      className="university-card" 
      style={{ animationDelay: `${index * 0.05}s`, textDecoration: 'none', color: 'inherit' }}
    >
      <button
        className={`wishlist-toggle-btn ${isInWishlist ? "in-wishlist" : ""}`}
        onClick={handleWishlistClick}
        disabled={isLoading}
        aria-label="Toggle Wishlist"
      >
        {isLoading ? (
          <span className="spinner-small" />
        ) : (
          <>
            <svg className="heart-icon-outline" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <svg className="heart-icon-filled" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </>
        )}
      </button>

      <h3 className="uni-name">{university.name}</h3>
      <div className="uni-country">
        <span>📍</span>
        {university.country}
      </div>
      
      <p className="uni-card-description">
        {university.description?.substring(0, 100) || "Información de la universidad no disponible."}
        {university.description && university.description.length > 100 && "..."}
      </p>

      <div className="uni-stats">
        <div className="uni-stat">
          <span className="uni-stat-label">Ranking QS</span>
          <span className="uni-ranking-badge">
            {university.qs_rating_top}
            {university.qs_rating_bottom !== university.qs_rating_top && ` - ${university.qs_rating_bottom}`}
          </span>
        </div>
          <div className="uni-stat">
            <span className="uni-stat-label">Valoración</span>
            <span className="uni-stat-value">
              ⭐ {university.overall_avg_rating!.toFixed(1)} ({university.review_count})
            </span>
          </div>
      </div>
    </Link>
  );
}