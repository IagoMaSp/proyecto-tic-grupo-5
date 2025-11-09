import { useState, useEffect, useCallback } from "react";
import * as api from "../api";
import type { University, Review } from "../api";
import { useDebounce } from "./useDebounce";

export interface CompareUniversity extends University {
  latestReviews: Review[];
}

export function useCompareUniversities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<CompareUniversity[]>([]);
  const [wishlistItems, setWishlistItems] = useState<University[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Cargar wishlist al montar
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoadingWishlist(true);
        const wishlist = await api.getWishlistWithDetails();
        setWishlistItems(wishlist.map(item => item.university_details));
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlistItems([]);
      } finally {
        setIsLoadingWishlist(false);
      }
    };

    loadWishlist();
  }, []);

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
      } catch (error) {
        console.error("Error searching universities:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUniversities();
  }, [debouncedQuery]);

  // Agregar universidad a la comparación
  const addUniversity = useCallback(async (university: University) => {
    if (selectedUniversities.length >= 3) {
      return;
    }

    if (selectedUniversities.some(u => u.id === university.id)) {
      return;
    }

    try {
      // Obtener las últimas 3 reviews
      const reviews = await api.getReviews(university.id);
      const latestReviews = reviews.slice(0, 3);

      const compareUni: CompareUniversity = {
        ...university,
        latestReviews
      };

      setSelectedUniversities(prev => [...prev, compareUni]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding university:", error);
    }
  }, [selectedUniversities]);

  // Remover universidad de la comparación
  const removeUniversity = useCallback((id: number) => {
    setSelectedUniversities(prev => prev.filter(u => u.id !== id));
  }, []);

  // Limpiar comparación
  const clearComparison = useCallback(() => {
    setSelectedUniversities([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedUniversities,
    wishlistItems,
    isSearching,
    isLoadingWishlist,
    addUniversity,
    removeUniversity,
    clearComparison,
    canAddMore: selectedUniversities.length < 3,
  };
}