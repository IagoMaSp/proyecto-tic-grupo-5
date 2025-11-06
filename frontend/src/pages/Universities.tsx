import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as api from "../api"; // Importar todo como api
import type { University } from "../api"; // Importar el tipo

type SortOption = "qs_rating_top" | "-qs_rating_top" | "-overall_avg_rating" | "-visits_count";

// Constantes
const FACULTIES = ["FIUM", "FCEE", "Psicología", "FHUMyE", "FCOM", "FDER"];

export default function Universities() {
  // Estados
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [faculty, setFaculty] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("qs_rating_top");
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "UM Exchange | Universidades";
    fetchCountries();

  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [query, country, faculty, sortBy]);
  
  async function fetchCountries() {
    try {
      // MODIFICACIÓN: Usar el endpoint de la api.ts
      const data = await api.getFilterOptions(); 
      setCountries(data.countries || []);
    } catch (err) {
      console.error("Error cargando países:", err);
      setCountries([]);
    }
  }

  async function fetchUniversities() {
    setLoading(true);
    setError(null);
    
    try {
      // MODIFICACIÓN: Crear el objeto de filtros
      type ExtendedFilters = api.UniversityFilters & { faculty?: string };
      const filters: ExtendedFilters = {
        search: query || undefined,
        country: country || undefined,
        faculty: faculty || undefined,
        ordering: sortBy
      };

      // MODIFICACIÓN: Usar la función de api.ts
      const data = await api.getUniversities(filters);

      // MODIFICACIÓN: El backend devuelve un objeto { results: [...] }
      setUniversities(data.results || []);

    } catch (err) {
      console.error("Error cargando universidades:", err);
      setError(err instanceof Error ? err.message : "Error al cargar universidades");
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  }

  const activeFiltersCount = [country, faculty].filter(Boolean).length;

  const handleClearFilters = () => {
    setCountry("");
    setFaculty("");
    setQuery("");
  };

  return (
    <section className="container">
      <div className="card">
        {/* Header */}
        <div className="mb-32">
          <h1 className="section-title">Universidades con convenio</h1>
          <p className="section-sub">
            Explorá {loading ? "..." : universities.length} universidades. Filtrá por país, facultad o ranking QS para encontrar tu destino ideal.
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="search-filter-section">
          <div className="search-filter-bar">
            {/* Campo de búsqueda */}
            <div className="search-input-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Buscar universidad..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
              {query && (
                <button onClick={() => setQuery("")} className="clear-search-btn" aria-label="Limpiar búsqueda">
                  ✕
                </button>
              )}
            </div>

            {/* Botón de filtros */}
            <button onClick={() => setShowFilters(!showFilters)} className={`filter-toggle-btn ${showFilters ? "active" : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span>Filtros</span>
              {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
            </button>
          </div>

          {/* Panel de filtros expandible */}
          <div className={`filter-panel ${showFilters ? "open" : ""}`}>
            <div className="filter-panel-content">
              <div className="filter-section">
                <label className="filter-section-label">Filtros de búsqueda</label>
                <div className="filter-grid">
                  <div className="filter-item">
                    <label className="filter-label">País</label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="filter-select">
                      <option value="">Todos los países</option>
                      {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="filter-item">
                    <label className="filter-label">Facultad con convenio</label>
                    <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="filter-select">
                      <option value="">Todas las facultades</option>
                      {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <label className="filter-section-label">Ordenar por</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="filter-select" style={{ maxWidth: "400px" }}>
                  <optgroup label="Ranking QS">
                    <option value="qs_rating_top">QS: Ascendente (menor número = mejor)</option>
                    <option value="-qs_rating_top">QS: Descendente</option>
                  </optgroup>
                  <optgroup label="Valoración de alumnos">
                    <option value="-overall_avg_rating">Mejor valoradas por alumnos</option>
                  </optgroup>
                  <optgroup label="Popularidad">
                    <option value="-visits_count">Más visitadas</option>
                  </optgroup>
                </select>
              </div>

              {(activeFiltersCount > 0 || query) && (
                <button onClick={handleClearFilters} className="clear-filters-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="results-section">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchUniversities} />
          ) : universities.length === 0 ? (
            <EmptyState query={query} onClear={handleClearFilters} />
          ) : (
            <>
              <div className="results-header">
                <p className="results-count">
                  {universities.length} {universities.length === 1 ? "universidad encontrada" : "universidades encontradas"}
                </p>
              </div>
              <div className="universities-grid">
                {universities.map((uni, index) => (
                  <UniversityCard key={uni.id} university={uni} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Componentes auxiliares
function LoadingState() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">Cargando universidades...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Error al cargar</h3>
      <p className="error-message">{message}</p>
      <button onClick={onRetry} className="retry-btn">Reintentar</button>
    </div>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="empty-container">
      <div className="empty-icon">🔍</div>
      <h3 className="empty-title">No se encontraron universidades</h3>
      <p className="empty-message">
        {query ? `No hay resultados para "${query}". Intenta con otros filtros.` : "No hay universidades que coincidan con los filtros seleccionados."}
      </p>
      <button onClick={onClear} className="retry-btn">Limpiar filtros</button>
    </div>
  );
}

function UniversityCard({ university, index }: { university: University; index: number }) {
  return (
    <Link 
      to={`/universities/${university.id}`} 
      className="university-card" 
      style={{ animationDelay: `${index * 0.05}s`, textDecoration: 'none', color: 'inherit' }}
    >
      <h3 className="uni-name">{university.name}</h3>
      <div className="uni-country">
        <span>📍</span>
        {university.country}
      </div>
      <div className="uni-stats">
        <div className="uni-stat">
          <span className="uni-stat-label">Ranking QS</span>
          <span className="uni-ranking-badge">
            {university.qs_rating_top}
            {university.qs_rating_bottom !== university.qs_rating_top && ` - ${university.qs_rating_bottom}`}
          </span>
        </div>
      </div>
    </Link>
  );
}