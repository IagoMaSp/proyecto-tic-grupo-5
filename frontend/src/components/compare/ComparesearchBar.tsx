import { useAuth } from "../../contexts/authContext";
import type { University } from "../../api";

interface CompareSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: University[];
  wishlistItems: University[];
  isSearching: boolean;
  isLoadingWishlist: boolean;
  onSelectUniversity: (university: University) => void;
  canAddMore: boolean;
}

export default function CompareSearchBar({
  searchQuery,
  setSearchQuery,
  searchResults,
  wishlistItems,
  isSearching,
  isLoadingWishlist,
  onSelectUniversity,
  canAddMore,
}: CompareSearchBarProps) {
  const { isAuthenticated } = useAuth();

  const showWishlist = !searchQuery && isAuthenticated;
  const showResults = searchQuery.length > 0 && searchResults.length > 0;
  const showEmpty = searchQuery.length > 0 && !isSearching && searchResults.length === 0;

  return (
    <div className="compare-search-container">
      <div className="search-input-wrapper">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder={canAddMore ? "Buscar universidad para comparar..." : "Máximo 3 universidades"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          disabled={!canAddMore}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="clear-search-btn"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (
        <div className="compare-search-results">
          {searchResults.map((uni) => (
            <button
              key={uni.id}
              className="compare-search-item"
              onClick={() => onSelectUniversity(uni)}
            >
              <div className="compare-search-info">
                <div className="compare-search-name">{uni.name}</div>
                <div className="compare-search-country">📍 {uni.country}</div>
              </div>
              <div className="compare-search-add">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {showEmpty && (
        <div className="compare-search-empty">
          <div className="empty-icon">🔍</div>
          <p>No se encontraron resultados para "{searchQuery}"</p>
        </div>
      )}

      {/* Loading */}
      {isSearching && (
        <div className="compare-search-loading">
          <div className="loading-spinner" />
          <p>Buscando...</p>
        </div>
      )}

      {/* Wishlist */}
      {showWishlist && (
        <div className="compare-wishlist-section">
          <div className="compare-wishlist-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Tu Wishlist</span>
          </div>
          
          {isLoadingWishlist ? (
            <div className="compare-wishlist-loading">
              <div className="loading-spinner" />
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="compare-wishlist-empty">
              <p>Tu wishlist está vacía</p>
              <a href="/universities">Explorar universidades</a>
            </div>
          ) : (
            <div className="compare-wishlist-grid">
              {wishlistItems.map((uni) => (
                <button
                  key={uni.id}
                  className="compare-wishlist-item"
                  onClick={() => onSelectUniversity(uni)}
                >
                  <div className="compare-wishlist-info">
                    <div className="compare-wishlist-name">{uni.name}</div>
                    <div className="compare-wishlist-country">{uni.country}</div>
                  </div>
                  <div className="compare-wishlist-badge">
                    QS #{uni.qs_rating_top}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensaje para usuarios no logueados */}
      {!searchQuery && !isAuthenticated && (
        <div className="compare-login-prompt">
          <div className="login-prompt-icon">🔐</div>
          <h3>Inicia sesión para ver tu wishlist</h3>
          <p>Guarda tus universidades favoritas y compáralas fácilmente</p>
          <a href="/login" className="btn primary">
            Iniciar sesión
          </a>
        </div>
      )}
    </div>
  );
}