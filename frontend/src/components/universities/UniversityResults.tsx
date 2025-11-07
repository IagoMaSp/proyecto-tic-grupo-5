import type { University } from "../../api";
import { LoadingState, ErrorState, EmptyState } from "../StatusComponents";
import UniversityCard from "./UniversityCard";

type UniversityResultsProps = {
  loading: boolean;
  error: string | null;
  universities: University[];
  query: string;
  onRetry: () => void;
  onClearFilters: () => void;
};

/**
 * Componente para mostrar los resultados de la búsqueda.
 * Maneja los estados de carga, error, vacío y la lista de resultados.
 */
export default function UniversityResults({
  loading, error, universities, query, onRetry, onClearFilters
}: UniversityResultsProps) {
  
  // 1. Estado de Carga
  if (loading) {
    return <LoadingState />;
  }

  // 2. Estado de Error
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // 3. Estado Vacío
  if (universities.length === 0) {
    return <EmptyState query={query} onClear={onClearFilters} />;
  }

  // 4. Estado con Resultados
  return (
    <div className="results-section">
      <div className="results-header">
        <p className="results-count">
          {universities.length} {universities.length === 1 ? "universidad encontrada" : "universidades encontradas"}
        </p>
      </div>
      <div className="universities-grid">
        {universities.map((uni, index) => (
          <UniversityCard key={uni.id} university={uni} index={index} />
        ))}
      </div>
    </div>
  );
}