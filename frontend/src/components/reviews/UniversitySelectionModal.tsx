import { useEffect, useState } from "react";
import * as api from "../../api";
import type { University, UniversityFilters } from "../../api";
import UniversityFiltersProps from "../UniversityFilters";

// Hook para "debouncing"
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface UniversitySelectionModalProps {
  onSelect: (university: University) => void;
  onClose: () => void;
}

export default function UniversitySelectionModal({
  onSelect,
  onClose,
}: UniversitySelectionModalProps) {
  // Se eliminó la vista de "wishlist"
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Usamos el tipo 'UniversityFilters' de tu api.ts
  const [filters, setFilters] = useState<UniversityFilters>({});
  
  // Ya no hay 'filterOptions'
  
  const debouncedFilters = useDebounce(filters, 300);

  // Se eliminó el useEffect para 'fetchOptions'

  // Se eliminó el useEffect para 'fetchWishlist'

  // Ejecutar búsqueda/filtrado
  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        // Solo buscar si hay algún filtro aplicado
        if (Object.keys(debouncedFilters).length > 0) {
          const data = await api.getUniversities(debouncedFilters);
          setSearchResults(data);
        } else {
          setSearchResults([]); // Limpiar si no hay filtros
        }
      } catch (error) {
        console.error("Error searching universities:", error);
      }
      setLoading(false);
    };
    fetchUniversities();
  }, [debouncedFilters]);

  const renderUniversityItem = (university: University) => (
    <div
      key={university.id}
      className="uni-search-item"
      onClick={() => onSelect(university)}
    >
      <div>
        <span className="name">{university.name}</span>
        <span className="country">{university.country}</span>
      </div>
      <button className="btn primary btn-select-uni">Elegir</button>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Seleccioná una Universidad</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        {/* Se eliminaron los tabs del modal */}
        
        <div className="modal-body">
          {/* Ya no hay 'view' */}
          <>
            <UniversityFiltersProps
              filters={filters}
              onFilterChange={setFilters}
              // Ya no se pasan 'options'
            />
            <div className="uni-search-list" style={{marginTop: '16px'}}>
              {loading && <p>Buscando...</p>}
              {!loading &&
                searchResults.map((uni) => renderUniversityItem(uni))}
              {!loading &&
                searchResults.length === 0 &&
                Object.keys(debouncedFilters).length > 0 && (
                  <p>No se encontraron resultados para esos filtros.</p>
                )}
               {!loading &&
                searchResults.length === 0 &&
                Object.keys(debouncedFilters).length === 0 && (
                  <p>Aplicá un filtro para buscar universidades.</p>
                )}
            </div>
          </>
          
          {/* Se eliminó el 'view === "wishlist"' */}
          
        </div>
      </div>
    </div>
  );
}