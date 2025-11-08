import type { University } from "../../api";

interface UniversityInfoProps {
  university: University;
}

export default function UniversityInfo({ university }: UniversityInfoProps) {
  const getGoogleMapSearchUrl = () => {
    const query = encodeURIComponent(`${university.name}, ${university.country}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const hasRatings = [university.avg_social, university.avg_academic, university.avg_place].some(
    (v) => v && v > 0
  );  
  
  const showRating = university.overall_avg_rating && university.overall_avg_rating > 0;

  return (
    <div className="university-info-section">
      <div className="info-card">
        <h2 className="info-card-title">Sobre la universidad</h2>
        <p className="info-card-text">
          {university.description || 
            `${university.name} es una institución de educación superior ubicada en ${university.country}, reconocida internacionalmente y con convenio vigente con la Universidad de Montevideo.`}
        </p>

        <a href={university.web_pages} target="_blank" rel="noopener noreferrer" className="btn ghost">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Visitar sitio web oficial
        </a>
      </div>

      <div className="info-card">
        <h2 className="info-card-title">Información académica</h2>
        <div className="info-grid">
          <div className="info-item">
            <div className="info-item-icon">🏆</div>
            <div className="info-item-content">
              <div className="info-item-label">Ranking QS</div>
              <div className="info-item-value">
                {university.qs_rating_top}
                {university.qs_rating_bottom !== university.qs_rating_top && ` - ${university.qs_rating_bottom}`}
              </div>
              <div className="info-item-desc">Posición mundial</div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-icon">🌍</div>
            <div className="info-item-content">
              <div className="info-item-label">Ubicación</div>
              <div className="info-item-value">{university.country}</div>
              <div className="info-item-desc">{university.continent}</div>
            </div>
          </div>

          <div className="info-item">
            <div className="info-item-icon">⭐</div>
            <div className="info-item-content">
              <div className="info-item-label">Valoración general</div>
              <div className="info-item-value">
                {showRating ? `${university.overall_avg_rating!.toFixed(1)}/5` : "—"}
              </div>
              <div className="info-item-desc">
                {showRating ? "Basado en reviews de alumnos" : "Sin valoraciones aún"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasRatings && (
        <div className="info-card">
          <h2 className="info-card-title">Valoraciones por categoría</h2>
          <div className="ratings-detailed">
            {university.avg_social && university.avg_social > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-header">
                  <span className="rating-bar-label">Vida Social</span>
                  <span className="rating-bar-value">{university.avg_social.toFixed(1)}</span>
                </div>
                <div className="rating-bar-track">
                  <div className="rating-bar-fill" style={{ width: `${(university.avg_social / 5) * 100}%` }} />
                </div>
              </div>
            )}

            {university.avg_academic && university.avg_academic > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-header">
                  <span className="rating-bar-label">Nivel Académico</span>
                  <span className="rating-bar-value">{university.avg_academic.toFixed(1)}</span>
                </div>
                <div className="rating-bar-track">
                  <div className="rating-bar-fill" style={{ width: `${(university.avg_academic / 5) * 100}%` }} />
                </div>
              </div>
            )}

            {university.avg_place && university.avg_place > 0 && (
              <div className="rating-bar-item">
                <div className="rating-bar-header">
                  <span className="rating-bar-label">Lugar e Infraestructura</span>
                  <span className="rating-bar-value">{university.avg_place.toFixed(1)}</span>
                </div>
                <div className="rating-bar-track">
                  <div className="rating-bar-fill" style={{ width: `${(university.avg_place / 5) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="info-card">
        <h2 className="info-card-title">Ubicación</h2>
        <div className="map-container">
          <iframe
            src={getGoogleMapSearchUrl()}
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '12px' }}
            loading="lazy"
            title={`Mapa de ${university.name}`}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="map-note">
          📍 {university.name}, {university.country}
        </p>
      </div>
    </div>
  );
}