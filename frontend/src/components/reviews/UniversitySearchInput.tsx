import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import * as api from "../../api";
import type { University } from "../../api";

interface UniversitySearchInputProps {
  onSelect: (university: University) => void;
  placeholder?: string;
  selectedUniversity?: University | null;
}

export default function UniversitySearchInput({ 
  onSelect, 
  placeholder = "Buscar universidad...",
  selectedUniversity 
}: UniversitySearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Buscar universidades
  useEffect(() => {
    const searchUniversities = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const data = await api.getUniversities({ search: debouncedQuery });
        setSearchResults(data.results || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Error searching universities:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUniversities();
  }, [debouncedQuery]);

  const handleSelect = (university: University) => {
    onSelect(university);
    setSearchQuery("");
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <div className="university-search-input-container">
      <div 
        className="university-search-input-wrapper"
        onClick={() => setIsOpen(true)}
      >
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder={selectedUniversity ? selectedUniversity.name : placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="university-search-input"
        />
        {(searchQuery || selectedUniversity) && (
          <button
            onClick={handleClear}
            className="clear-search-btn"
            type="button"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (searchResults.length > 0 || isSearching || (searchQuery && !isSearching)) && (
        <>
          <div 
            className="university-search-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="university-search-results">
            {isSearching ? (
              <div className="university-search-loading">
                <div className="loading-spinner" />
                <p>Buscando...</p>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((uni) => (
                <button
                  key={uni.id}
                  className="university-search-item"
                  onClick={() => handleSelect(uni)}
                  type="button"
                >
                  <div className="university-search-info">
                    <div className="university-search-name">{uni.name}</div>
                    <div className="university-search-country">📍 {uni.country}</div>
                  </div>
                  <div className="university-search-select">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                  </div>
                </button>
              ))
            ) : searchQuery ? (
              <div className="university-search-empty">
                <div className="empty-icon">🔍</div>
                <p>No se encontraron resultados para "{searchQuery}"</p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}