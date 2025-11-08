import { useState, useEffect } from "react";
import type { University } from "../../api";
import { LoadingState, ErrorState, EmptyState } from "../StatusComponents";
import UniversityCard from "./UniversityCard";
import { 
  getUserWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from "../../api";
import { useAuth } from "../../contexts/authContext"; // Importar useAuth

type UniversityResultsProps = {
  loading: boolean;
  error: string | null;
  universities: University[];
  query: string;
  onRetry: () => void;
  onClearFilters: () => void;
};

/**
 * Componente para mostrar los resultados de la búsqueda.
 * Maneja los estados de carga, error, vacío y la lista de resultados.
 */
export default function UniversityResults({
  loading,
  error,
  universities,
  query,
  onRetry,
  onClearFilters
}: UniversityResultsProps) {
  // Obtener el estado de autenticación del contexto
  const { isAuthenticated } = useAuth();
  
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Cargar wishlist del usuario al montar el componente o cuando cambie el estado de login
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlistIds(new Set()); // Limpiar wishlist si no está logueado
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    try {
      const wishlistArray = await getUserWishlist();
      setWishlistIds(new Set(wishlistArray));
    } catch (error) {
      console.error("Error al cargar wishlist:", error);
    }
  };

  const handleAddToWishlist = async (universityId: number) => {
    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    try {
      await addToWishlist(universityId);
      setWishlistIds(prev => new Set([...prev, universityId]));
    } catch (error) {
      console.error("Error al agregar a wishlist:", error);
      // Mostrar mensaje de error al usuario
      alert("Error al agregar a la wishlist. Por favor, intenta de nuevo.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (universityId: number) => {
    if (isWishlistLoading) return;

    setIsWishlistLoading(true);
    try {
      await removeFromWishlist(universityId);
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(universityId);
        return newSet;
      });
    } catch (error) {
      console.error("Error al quitar de wishlist:", error);
      alert("Error al quitar de la wishlist. Por favor, intenta de nuevo.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleShowLoginWarning = () => {
    setShowLoginWarning(true);
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      setShowLoginWarning(false);
    }, 4000);
  };

  // 1. Estado de Carga
  if (loading) {
    return <LoadingState />;
  }

  // 2. Estado de Error
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // 3. Estado Vacío
  if (universities.length === 0) {
    return <EmptyState query={query} onClear={onClearFilters} />;
  }

  // 4. Estado con Resultados
  return (
    <div className="results-section">
      {/* Warning de login */}
      {showLoginWarning && (
        <div className="login-warning">
          <div className="login-warning-content">
            <span className="warning-icon">⚠️</span>
            <span>Debes iniciar sesión para agregar universidades a tu wishlist</span>
            <button
              className="warning-close"
              onClick={() => setShowLoginWarning(false)}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="results-header">
        <p className="results-count">
          {universities.length} {universities.length === 1 ? "universidad encontrada" : "universidades encontradas"}
        </p>
      </div>
      
      <div className="universities-grid">
        {universities.map((uni, index) => (
          <UniversityCard
            key={uni.id}
            university={uni}
            index={index}
            isLoggedIn={isAuthenticated}
            isInWishlist={wishlistIds.has(uni.id)}
            onAddToWishlist={handleAddToWishlist}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onShowLoginWarning={handleShowLoginWarning}
          />
        ))}
      </div>
    </div>
  );
}