import type { WishlistWithDetails } from "../../api";
import { Link } from "react-router-dom";

interface UserWishlistProps {
  wishlistItems: WishlistWithDetails[];
}

export default function UserWishlist({ wishlistItems }: UserWishlistProps) {
  if (wishlistItems.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="section-title mb-16">Mi Wishlist</h2>
        <p>Tu wishlist está vacía.</p>
        <p>Explorá las <a href="/universities">universidades</a> y guardá tus favoritas.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title mb-24">Mi Wishlist</h2>
      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <WishlistCard key={item.id} item={item.university_details} />
        ))}
      </div>
    </div>
  );
}

// Componente interno para la tarjeta de wishlist
function WishlistCard({ item }: { item: WishlistWithDetails['university_details'] }) {
  if (!item) return null; // Seguridad por si 'university_details' no vino

  return (
    <Link to={`/universities/${item.id}`} className="wishlist-card">
      <div>
        <h3 className="uni-name">{item.name}</h3>
        <span className="uni-country">{item.country}</span>
      </div>
      <div className="uni-stats">
        <div className="uni-stat">
          <span className="uni-stat-label">Ranking QS</span>
          <span className="uni-ranking-badge">
            {item.qs_rating_top}
            {item.qs_rating_bottom !== item.qs_rating_top && ` - ${item.qs_rating_bottom}`}
          </span>
        </div>
        {item.review_count && item.review_count > 0 && (
          <div className="uni-stat">
            <span className="uni-stat-label">Valoración</span>
            <span className="uni-stat-value">
              ⭐ {item.overall_avg_rating ? item.overall_avg_rating.toFixed(1) : '-'} ({item.review_count})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}