import type { UniversityFilters } from "../../api.ts";

interface UniversityFiltersProps {
  filters: UniversityFilters;
  onFilterChange: (filters: UniversityFilters) => void;
}

export default function UniversityFilters({ filters, onFilterChange }: UniversityFiltersProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value === "" ? undefined : value,
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