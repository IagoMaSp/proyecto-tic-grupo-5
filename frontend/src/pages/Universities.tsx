import { useEffect, useState } from "react";

// Tipos
type University = {
  id: number;
  name: string;
  country: string;
  qs_rating_top: number;
  qs_rating_bottom: number;
  web_pages: string;
  status: string;
  continent: "Africa" | "America" | "Asia" | "Europe" | "Oceania";
  visits_count: number;
};

type SortOption = "qs_asc" | "qs_desc" | "academic_desc" | "social_desc" | "place_desc" | "visits_desc";

// Constantes
const COUNTRIES = ["Argentina", "Chile", "España", "Portugal", "México", "Colombia", "Brasil", "Italia", "Francia", "Alemania"];
const FACULTIES = ["FIUM", "FCEE", "Psicología", "FHUMyE", "FCOM", "FDER"];

export default function Universities() {
  // Estados
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [faculty, setFaculty] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("qs_asc");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "UM Exchange | Universidades";
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [query, country, faculty, sortBy]);

  async function fetchUniversities() {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        ...(query && { search: query }),
        ...(country && { country }),
        ...(sortBy && { ordering: sortBy }),
      });

      const res = await fetch(`/api/universities/?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron cargar las universidades`);
      }

      const data: University[] = await res.json();
      setUniversities(data);
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
            Explorá {universities.length} universidades. Filtrá por país, facultad o ranking QS para encontrar tu destino ideal.
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
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
                    <option value="qs_asc">QS: Mejor a peor (1 → 1000)</option>
                    <option value="qs_desc">QS: Peor a mejor (1000 → 1)</option>
                  </optgroup>
                  <optgroup label="Valoración de alumnos">
                    <option value="academic_desc">Educación: Mejor valorada</option>
                    <option value="social_desc">Vida social: Mejor valorada</option>
                    <option value="place_desc">Ubicación: Mejor valorada</option>
                  </optgroup>
                  <optgroup label="Popularidad">
                    <option value="visits_desc">Más visitadas</option>
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
    <div className="university-card" style={{ animationDelay: `${index * 0.05}s` }}>
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
        {university.visits_count > 0 && (
          <div className="uni-stat">
            <span className="uni-stat-label">Visitas</span>
            <span className="uni-stat-value">{university.visits_count}</span>
          </div>
        )}
      </div>
    </div>
  );
}