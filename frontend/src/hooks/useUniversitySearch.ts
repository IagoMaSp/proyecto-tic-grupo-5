import { useState, useEffect, useCallback } from "react";
import * as api from "../api.ts";
import type { University } from "../api.ts";
import { useDebounce } from "./useDebounce.ts"; 
import { useAuth } from "../contexts/authContext.tsx"; 

export type SortOption = "qs_rating_top" | "-qs_rating_top" | "-overall_avg_rating" | "-visits_count";

export function useUniversitySearch() {
  const { isAuthenticated } = useAuth(); 

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [faculty, setFaculty] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("qs_rating_top");
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState(new Set<number>()); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  const fetchFilterData = useCallback(async () => {
    try {
      const data = await api.getFilterOptions(); 
      setCountries(data.countries || []);
    } catch (err) {
      console.error("Error cargando países:", err);
      setCountries([]);
    }

    if (isAuthenticated) {
      try {
        const wishlistData = await api.getWishlist();
        const wishlistIds = new Set(wishlistData.map(item => item.university));
        setWishlist(wishlistIds);
      } catch (err) {
        console.error("Error cargando wishlist:", err);
        setWishlist(new Set<number>());
      }
    }
  }, [isAuthenticated]); 

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
  }, [debouncedQuery, country, faculty, sortBy]); 

  useEffect(() => {
    document.title = "UM Exchange | Universidades";
    fetchFilterData(); 
  }, [fetchFilterData]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]); 

  const handleClearFilters = () => {
    setCountry("");
    setFaculty("");
    setQuery("");
  };

  const toggleWishlistLocal = (universityId: number) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(universityId)) {
        newWishlist.delete(universityId);
      } else {
        newWishlist.add(universityId);
      }
      return newWishlist;
    });
  };

  const activeFiltersCount = [country, faculty].filter(Boolean).length;

  return {
    states: {
      query,
      country,
      faculty,
      sortBy,
      universities,
      countries,
      wishlist, 
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
      fetchUniversities,
      toggleWishlistLocal 
    }
  };
}