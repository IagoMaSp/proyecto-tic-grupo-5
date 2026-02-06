export default function CompareEmptyState() {
  return (
    <div className="compare-empty-state">
      <h2 className="compare-empty-title">Comenzá a comparar universidades</h2>
      <p className="compare-empty-text">
        Seleccioná hasta 3 universidades de tu Lista de Deseos o buscá en el campo de arriba para compararlas lado a lado
      </p>
      <div className="compare-empty-features">
        <div className="compare-empty-feature">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Compará rankings y valoraciones</span>
        </div>
        <div className="compare-empty-feature">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Leé las últimas reseñas de cada una</span>
        </div>
        <div className="compare-empty-feature">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Tomá la mejor decisión para tu intercambio</span>
        </div>
      </div>
    </div>
  );
}