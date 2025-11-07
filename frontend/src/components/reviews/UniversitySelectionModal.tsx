import { useEffect, useState } from "react";
import * as api from "../../api";
import type { University, UniversityFilters } from "../../api";
import UniversityFiltersComponent from "./UniversityFilters"; // Renombrado para evitar confusión
import { useDebounce } from "../../hooks/useDebounce"; // Importamos el hook refactorizado

interface UniversitySelectionModalProps {
  onSelect: (university: University) => void;
  onClose: () => void;
}

export default function UniversitySelectionModal({
  onSelect,
  onClose,
}: UniversitySelectionModalProps) {
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UniversityFilters>({});
  
  // Usamos el hook useDebounce para el objeto de filtros completo
  const debouncedFilters = useDebounce(filters, 300);

  // Ejecutar búsqueda/filtrado
  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        // MODIFICACIÓN: Solo buscar si 'search' tiene un valor.
        if (debouncedFilters.search && debouncedFilters.search.length > 0) {
          const data = await api.getUniversities(debouncedFilters);
          // MODIFICACIÓN: Acceder a 'data.results' o 'data' si no es paginado
          setSearchResults(data.results || data);
        } else {
          setSearchResults([]); // Limpiar si no hay búsqueda
        }
      } catch (error) {
        console.error("Error searching universities:", error);
      }
      setLoading(false);
    };

    fetchUniversities();
    
  }, [debouncedFilters]); // Se activa cuando el valor "debounced" cambia

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
        
        <div className="modal-body">
          <>
            <UniversityFiltersComponent
              filters={filters}
              onFilterChange={setFilters}
            />
            <div className="uni-search-list" style={{marginTop: '16px'}}>
              {loading && <p>Buscando...</p>}
              {!loading &&
                searchResults.map((uni) => renderUniversityItem(uni))}
              {!loading &&
                searchResults.length === 0 &&
                debouncedFilters.search && (
                  <p>No se encontraron resultados para "{debouncedFilters.search}".</p>
                )}
               {!loading &&
                searchResults.length === 0 &&
                !debouncedFilters.search && (
                  <p>Escribí al menos un caracter para buscar.</p>
                )}
            </div>
          </>
        </div>
      </div>
    </div>
  );
}