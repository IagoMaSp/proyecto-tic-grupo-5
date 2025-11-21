import type { SortOption } from "../../hooks/useUniversitySearch";

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

const FACULTIES = ["FIUM", "FCEE", "Psicología", "FHUMyE", "FCOM", "FDER"];

export default function UniversityFilters({
  query, setQuery, country, setCountry, faculty, setFaculty,
  sortBy, setSortBy, countries, showFilters, setShowFilters,
  activeFiltersCount, handleClearFilters
}: UniversityFiltersProps) {
  
  return (
    <div className="search-filter-section">
      {/* Barra de búsqueda principal */}
      <div className="search-filter-bar">
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

        <button onClick={() => setShowFilters(!showFilters)} className={`filter-toggle-btn ${showFilters ? "active" : ""}`}>
          <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filtros</span>
          {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
        </button>
      </div>

      {/* Panel de filtros expandible */}
      <div className={`filter-panel ${showFilters ? "open" : ""}`}>
        <div className="filter-panel-content">
          
          {/* Título de sección */}
          <div className="filter-section-header">
            <h3 className="filter-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Filtros de búsqueda
            </h3>
          </div>

          {/* Grid de filtros */}
          <div className="filter-grid">
            {/* Filtro de País */}
            <div className="filter-item">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
                </svg>
                País
              </label>
              <div className="select-wrapper">
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="filter-select">
                  <option value="">Todos los países</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {/* Filtro de Facultad */}
            <div className="filter-item">
              <label className="filter-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Facultad con convenio
              </label>
              <div className="select-wrapper">
                <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="filter-select">
                  <option value="">Todas las facultades</option>
                  {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Sección de Ordenar */}
          <div className="sort-section">
            <label className="sort-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="2" y1="14" x2="6" y2="14"></line>
                <line x1="10" y1="8" x2="14" y2="8"></line>
                <line x1="18" y1="16" x2="22" y2="16"></line>
              </svg>
              Ordenar por
            </label>
            <div className="select-wrapper">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="filter-select sort-select">
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
              <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          {(activeFiltersCount > 0 || query) && (
            <button onClick={handleClearFilters} className="clear-filters-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Limpiar todos los filtros
            </button>
          )}
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="active-filters-indicator">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span className="active-filters-text">
            {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro activo' : 'filtros activos'}
          </span>
          <div className="active-filters-tags">
            {country && (
              <span className="filter-tag">
                {country}
                <button onClick={() => setCountry('')} className="filter-tag-remove" aria-label="Quitar filtro">
                  ✕
                </button>
              </span>
            )}
            {faculty && (
              <span className="filter-tag">
                {faculty}
                <button onClick={() => setFaculty('')} className="filter-tag-remove" aria-label="Quitar filtro">
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}