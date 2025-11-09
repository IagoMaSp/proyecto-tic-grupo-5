import { useState } from "react";
import { useUniversitySearch } from "../hooks/useUniversitySearch.ts";
import UniversityFilters from "../components/universities/UniversitySearchFilters.tsx";
import UniversityResults from "../components/universities/UniversityResults.tsx";

const UNIVERSITIES_PER_PAGE = 30;

export default function Universities() {
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(UNIVERSITIES_PER_PAGE);
  
  const { states, handlers } = useUniversitySearch();

  const filterProps = {
    ...states,
    ...handlers,
    showFilters,
    setShowFilters,
  };

  const resultsProps = {
    loading: states.loading,
    error: states.error,
    universities: states.universities,
    query: states.query,
    onRetry: handlers.fetchUniversities,
    onClearFilters: handlers.handleClearFilters,
    wishlist: states.wishlist,
    toggleWishlistLocal: handlers.toggleWishlistLocal,
    visibleCount,
    setVisibleCount,
    totalCount: states.universities.length,
  };

  return (
    <section className="container">
      <div className="card">
        <div className="mb-32">
          <h1 className="section-title">Universidades con convenio</h1>
          <p className="section-sub">
            Explorá {states.loading ? "..." : states.universities.length} universidades. Filtrá por país, facultad o ranking QS para encontrar tu destino ideal.
          </p>
        </div>

        <UniversityFilters {...filterProps} />
        
        <UniversityResults {...resultsProps} />
        
      </div>
    </section>
  );
}