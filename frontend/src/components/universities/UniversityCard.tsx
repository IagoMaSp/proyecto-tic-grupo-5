import { Link } from "react-router-dom";
import type { University } from "../../api";
import type { MouseEvent } from "react"

type UniversityCardProps ={
  university: University;
  index: number;
  isLoggedIn: boolean
  isInWishlist: boolean;
  onAddToWishlist: (universityId:number) => void;
  onRemoveFromWishlist:(universityId:number) => void;
  onShowLoginWarning: () => void;
}

function WishlistIcon({filled}:{filled:boolean}){
  return(
    <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill ={filled ? "currentColor":"none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="wishlist-icon">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}
/**
 * Componente para mostrar la tarjeta de una universidad.
 */
export default function UniversityCard({university,index,isLoggedIn,isInWishlist,onAddToWishlist,onRemoveFromWishlist, onShowLoginWarning}: UniversityCardProps){
  const handleWishlistClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); //eviata que se entre a la universidad si se toca el boton
    e.stopPropagation() //evita que el click se propague al link
    if (!isLoggedIn){
      onShowLoginWarning();
    }
    else{
      if (isInWishlist){
        onRemoveFromWishlist(university.id);
      } else{
        onAddToWishlist(university.id);
      }
    }
  };

  return (
    <Link 
      to={`/universities/${university.id}`} 
      className="university-card" 
      // La animación escalonada es un buen detalle
      style={{ animationDelay: `${index * 0.05}s`, textDecoration: 'none', color: 'inherit' }}
    >
      <div className="uni-header">
        <h3 className="uni-name">{university.name}</h3>
        <button onClick={handleWishlistClick} 
        className={`wishlist-button ${isInWishlist ? 'active': ''}`}
        aria-label={isInWishlist ? 'Quitar de lista de deseos': 'Añadir a lista de deseos'}
        type='button'
        >
          <WishlistIcon filled={isInWishlist}/>
        </button>
      </div>
      <div className="uni-country">
        <span>📍</span>
        {university.country}
      </div>
      <div className="uni-stats">
        <div className="uni-stat">
          <span className="uni-stat-label">Ranking QS</span>
          <span className="uni-ranking-badge">
            {university.qs_rating_top}
            {/* Mostrar rango si existe */}
            {university.qs_rating_bottom !== university.qs_rating_top && ` - ${university.qs_rating_bottom}`}
          </span>
        </div>
      </div>
    </Link>
  );
}