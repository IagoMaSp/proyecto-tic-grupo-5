import type { University } from "../../api.ts";
import { LoadingState, ErrorState, EmptyState } from "../StatusComponents.tsx";
import UniversityCard from "./UniversityCard.tsx";

const UNIVERSITIES_PER_PAGE = 30;

type UniversityResultsProps = {
  loading: boolean;
  error: string | null;
  universities: University[];
  query: string;
  onRetry: () => void;
  onClearFilters: () => void;
  wishlist: Set<number>;
  toggleWishlistLocal: (universityId: number) => void;
  visibleCount: number;
  setVisibleCount: (fn: (prev: number) => number) => void;
  totalCount: number;
};

export default function UniversityResults({
  loading, error, universities, query, onRetry, onClearFilters,
  wishlist, toggleWishlistLocal, visibleCount, setVisibleCount, totalCount
}: UniversityResultsProps) {
  
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (universities.length === 0) {
    return <EmptyState query={query} onClear={onClearFilters} />;
  }

  const visibleUniversities = universities.slice(0, visibleCount);
  const canLoadMore = visibleCount < totalCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + UNIVERSITIES_PER_PAGE);
  };

  return (
    <div className="results-section">
      <div className="results-header">
        <p className="results-count">
          {universities.length} {universities.length === 1 ? "universidad encontrada" : "universidades encontradas"}
        </p>
      </div>
      <div className="universities-grid">
        {visibleUniversities.map((uni, index) => (
          <UniversityCard
            key={uni.id}
            university={uni}
            index={index}
            isInWishlist={wishlist.has(uni.id)}
            onToggleWishlist={toggleWishlistLocal}
          />
        ))}
      </div>
      
      {canLoadMore && (
        <div className="load-more-container">
          <button onClick={handleLoadMore} className="btn ghost">
            Ver más universidades
          </button>
        </div>
      )}
    </div>
  );
}