import { useState, useEffect } from 'react';

// Hook para "debouncing"
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // Configura un temporizador para actualizar el valor "debounced"
    // solo después de que haya pasado el tiempo de "delay"
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el temporizador si el valor cambia (evitando ejecuciones
    // innecesarias) o si el componente se desmonta.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
}