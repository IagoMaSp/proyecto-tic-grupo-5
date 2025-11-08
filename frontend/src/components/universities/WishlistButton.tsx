import { useState } from "react";
import { Link } from "react-router-dom";

interface WishlistButtonProps {
  isInWishlist: boolean;
  isAuthenticated: boolean;
  onToggle: () => Promise<void>;
}

export default function WishlistButton({ isInWishlist, isAuthenticated, onToggle }: WishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated && showLoginPrompt) {
    return (
      <div className="wishlist-card wishlist-prompt">
        <div className="wishlist-prompt-icon">🔐</div>
        <h3 className="wishlist-prompt-title">Inicia sesión para guardar</h3>
        <p className="wishlist-prompt-text">
          Creá tu cuenta para guardar universidades en tu wishlist
        </p>
        <Link to="/login" className="btn primary full-width">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-card">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`wishlist-btn ${isInWishlist ? "active" : ""} ${isLoading ? "loading" : ""}`}
      >
        {isLoading ? (
          <>
            <div className="wishlist-spinner" />
            <span>Guardando...</span>
          </>
        ) : isInWishlist ? (
          <>
            <svg className="wishlist-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="wishlist-text">Guardado en wishlist</span>
          </>
        ) : (
          <>
            <svg className="wishlist-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="wishlist-text">Guardar en wishlist</span>
          </>
        )}
      </button>

      {isInWishlist && (
        <p className="wishlist-success-msg">
          ✓ Esta universidad está en tu wishlist
        </p>
      )}
    </div>
  );
}