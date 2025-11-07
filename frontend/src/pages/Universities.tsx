import { useState } from "react";
import { useUniversitySearch } from "../hooks/useUniversitySearch";
import UniversityFilters from "../components/universities/UniversitySearchFilters";
import UniversityResults from "../components/universities/UniversityResults";

export default function Universities() {
  // El único estado que se maneja aquí es el de la UI (mostrar/ocultar filtros)
  const [showFilters, setShowFilters] = useState(false);
  
  // Toda la lógica de datos y filtros viene de nuestro custom hook
  const { states, handlers } = useUniversitySearch();

  // Preparamos los props para los componentes hijos
  const filterProps = {
    ...states,
    ...handlers,
    showFilters,
    setShowFilters,
  };

  const resultsProps = {
    loading: states.loading,
    error: states.error,
    universities: states.universities,
    query: states.query,
    onRetry: handlers.fetchUniversities,
    onClearFilters: handlers.handleClearFilters,
  };

  return (
    <section className="container">
      <div className="card">
        {/* Header */}
        <div className="mb-32">
          <h1 className="section-title">Universidades con convenio</h1>
          <p className="section-sub">
            Explorá {states.loading ? "..." : states.universities.length} universidades. Filtrá por país, facultad o ranking QS para encontrar tu destino ideal.
          </p>
        </div>

        {/* Componente de Filtros */}
        <UniversityFilters {...filterProps} />
        
        {/* Componente de Resultados */}
        <UniversityResults {...resultsProps} />
        
      </div>
    </section>
  );
}