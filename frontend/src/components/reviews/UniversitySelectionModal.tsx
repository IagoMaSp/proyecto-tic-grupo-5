import { useEffect, useState } from "react";
import * as api from "../../api";
import type { University, UniversityFilters } from "../../api";
import UniversityFiltersComponent from "./UniversityFilters";
import { useDebounce } from "../../hooks/useDebounce";

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
  
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        if (debouncedFilters.search && debouncedFilters.search.length > 0) {
          const data = await api.getUniversities(debouncedFilters);
          setSearchResults(data.results || data);
        } else {
          setSearchResults([]); 
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