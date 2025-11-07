import type { SortOption } from "../../hooks/useUniversitySearch";

// Props que recibe este componente "tonto"
type UniversityFiltersProps = {
  query: string;
  setQuery: (q: string) => void;
  country: string;
  setCountry: (c: string) => void;
  faculty: string;
  setFaculty: (f: string) => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  countries: string[];
  showFilters: boolean;
  setShowFilters: (s: boolean) => void;
  activeFiltersCount: number;
  handleClearFilters: () => void;
};

// Constantes locales
const FACULTIES = ["FIUM", "FCEE", "Psicología", "FHUMyE", "FCOM", "FDER"];

export default function UniversityFilters({
  query, setQuery, country, setCountry, faculty, setFaculty,
  sortBy, setSortBy, countries, showFilters, setShowFilters,
  activeFiltersCount, handleClearFilters
}: UniversityFiltersProps) {
  
  return (
    <div className="search-filter-section">
      {/* Barra de búsqueda y botón de filtros */}
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
              {/* Filtro de País */}
              <div className="filter-item">
                <label className="filter-label">País</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="filter-select">
                  <option value="">Todos los países</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Filtro de Facultad */}
              <div className="filter-item">
                <label className="filter-label">Facultad con convenio</label>
                <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="filter-select">
                  <option value="">Todas las facultades</option>
                  {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Filtro de Ordenar por */}
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

          {/* Botón de limpiar filtros */}
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
  );
}