import type { UniversityFilters } from "../api.ts";

interface UniversityFiltersProps {
  filters: UniversityFilters;
  onFilterChange: (filters: UniversityFilters) => void;
  // Ya no se reciben 'options'
}

export default function UniversityFilters({ filters, onFilterChange }: UniversityFiltersProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value === "" ? undefined : value, // Poner undefined si está vacío para limpiar el filtro
    });
  };

  return (
    <div className="university-filters">
      <div className="form-group">
        <label htmlFor="search" className="form-label">Buscar por nombre</label>
        <input
          type="text"
          id="search"
          name="search"
          className="form-input"
          placeholder="Nombre de la universidad..."
          value={filters.search || ""}
          onChange={handleChange}
        />
      </div>
      
      {/* NOTA: Los filtros de País y Continente (y otros) de tu api.ts 
        requerirían un <select>. Pero tu API no provee un endpoint 
        para obtener la lista de opciones (ej. todos los países). 
        Por ahora, solo implementamos 'search'.
      */}
      
      <style>{`
        .university-filters {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
    </div>
  );
}