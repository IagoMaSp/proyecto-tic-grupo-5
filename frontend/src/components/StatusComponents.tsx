export function LoadingState() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">Cargando universidades...</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Error al cargar</h3>
      <p className="error-message">{message}</p>
      <button onClick={onRetry} className="retry-btn">Reintentar</button>
    </div>
  );
}

export function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="empty-container">
      <div className="empty-icon">🔍</div>
      <h3 className="empty-title">No se encontraron universidades</h3>
      <p className="empty-message">
        {query ? `No hay resultados para "${query}". Intenta con otros filtros.` : "No hay universidades que coincidan con los filtros seleccionados."}
      </p>
      <button onClick={onClear} className="retry-btn">Limpiar filtros</button>
    </div>
  );
}