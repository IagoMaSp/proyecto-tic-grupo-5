import { useState, useEffect, useCallback } from "react";
import * as api from "../api";
import type { University } from "../api";
import { useDebounce } from "../hooks/useDebounce"; // Importamos el hook existente

// Tipo para las opciones de ordenamiento
export type SortOption = "qs_rating_top" | "-qs_rating_top" | "-overall_avg_rating" | "-visits_count";

/**
 * Hook personalizado para manejar toda la lógica de búsqueda,
 * filtrado y obtención de datos de universidades.
 */
export function useUniversitySearch() {
  // Estados de los filtros
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [faculty, setFaculty] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("qs_rating_top");
  
  // Estados de los datos
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  
  // Estados de la UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aplicamos debounce al query de búsqueda
  const debouncedQuery = useDebounce(query, 300);

  // --- Carga de Opciones de Filtros ---

  const fetchCountries = useCallback(async () => {
    try {
      const data = await api.getFilterOptions(); 
      setCountries(data.countries || []);
    } catch (err) {
      console.error("Error cargando países:", err);
      setCountries([]);
    }
  }, []);

  // --- Carga de Universidades ---

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      type ExtendedFilters = api.UniversityFilters & { faculty?: string };
      const filters: ExtendedFilters = {
        search: debouncedQuery || undefined,
        country: country || undefined,
        faculty: faculty || undefined,
        ordering: sortBy
      };

      const data = await api.getUniversities(filters);
      setUniversities(data.results || []);

    } catch (err) {
      console.error("Error cargando universidades:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar universidades";
      setError(errorMessage);
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, country, faculty, sortBy]); // Depende de los filtros

  // --- Efectos ---

  // Carga los países una vez al montar el componente
  useEffect(() => {
    document.title = "UM Exchange | Universidades";
    fetchCountries();
  }, [fetchCountries]);

  // Vuelve a cargar las universidades cada vez que los filtros (o el query con debounce) cambian
  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]); // fetchUniversities ya tiene las dependencias correctas

  // --- Manejadores de Eventos ---

  const handleClearFilters = () => {
    setCountry("");
    setFaculty("");
    setQuery("");
    // Opcional: podrías resetear el sortBy también
    // setSortBy("qs_rating_top"); 
  };

  // --- Valores Calculados ---

  const activeFiltersCount = [country, faculty].filter(Boolean).length;

  // Retornamos estados y manejadores de forma separada
  return {
    states: {
      query,
      country,
      faculty,
      sortBy,
      universities,
      countries,
      loading,
      error,
      activeFiltersCount
    },
    handlers: {
      setQuery,
      setCountry,
      setFaculty,
      setSortBy,
      handleClearFilters,
      fetchUniversities, // Exponemos para reintentar
    }
  };
}