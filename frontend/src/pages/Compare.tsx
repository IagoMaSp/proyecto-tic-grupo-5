import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useCompareUniversities } from "../hooks/useCompareUniversities";
import CompareSearchBar from "../components/compare/ComparesearchBar";
import CompareCard from "../components/compare/CompareCard";
import CompareEmptyState from "../components/compare/CompateEmptyState";
import * as api from "../api";

export default function Compare() {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedUniversities,
    wishlistItems,
    isSearching,
    isLoadingWishlist,
    addUniversity,
    removeUniversity,
    clearComparison,
    canAddMore,
  } = useCompareUniversities();

  const [searchParams] = useSearchParams();
  const hasLoadedFromUrlRef = useRef(false);

  useEffect(() => {
    document.title = "UM Exchange | Comparar";

    const uniIdFromUrl = searchParams.get('ids');
    if (uniIdFromUrl && !hasLoadedFromUrlRef.current) {
      hasLoadedFromUrlRef.current = true;
      const universityId = parseInt(uniIdFromUrl, 10);

      if (!isNaN(universityId)) {
        const addUniversityFromId = async (id: number) => {
          try {
            const universityToAdd = await api.getUniversity(id);
            if (universityToAdd) {
              addUniversity(universityToAdd);
            }
          } catch (error) {
            console.error("Error al pre-cargar universidad:", error);
          }
        };

        addUniversityFromId(universityId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, addUniversity]);

  return (
    <section className="container">
      <div className="card">
        <div className="compare-header">
          <h1 className="section-title">Comparar universidades</h1>
          <p className="section-sub">
            Seleccioná hasta 3 universidades para comparar sus rankings, valoraciones y reseñas
          </p>
        </div>

        <CompareSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          wishlistItems={wishlistItems}
          isSearching={isSearching}
          isLoadingWishlist={isLoadingWishlist}
          onSelectUniversity={addUniversity}
          canAddMore={canAddMore}
        />

        {selectedUniversities.length === 0 ? (
          <CompareEmptyState />
        ) : (
          <div className="compare-content">
            <div className="compare-actions">
              <div className="compare-count">
                {selectedUniversities.length} {selectedUniversities.length === 1 ? "universidad seleccionada" : "universidades seleccionadas"}
                {selectedUniversities.length < 3 && (
                  <span className="compare-hint">
                    (podés agregar {3 - selectedUniversities.length} más)
                  </span>
                )}
              </div>
              <button
                className="btn ghost"
                onClick={clearComparison}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                Limpiar comparación
              </button>
            </div>

            <div className="compare-grid">
              {selectedUniversities.map((uni, index) => (
                <CompareCard
                  key={uni.id}
                  university={uni}
                  onRemove={removeUniversity}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}