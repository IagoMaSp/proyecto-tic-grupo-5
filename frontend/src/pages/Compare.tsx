import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type University = {
  id: number;
  name: string;
  country: string;
  qs_rating_top: number;
  photos: string[];
  // ... otros campos
};

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [compareData, setCompareData] = useState<University[]>([]);

  useEffect(() => {
    document.title = "UM Exchange | Comparar";
    fetchUniversities();
    
    // Cargar IDs de la URL
    const ids = searchParams.get("ids");
    if (ids) {
      setSelectedIds(ids.split(",").map(Number));
    }
  }, []);

  useEffect(() => {
    if (selectedIds.length > 0) {
      loadCompareData();
    }
  }, [selectedIds]);

  async function fetchUniversities() {
    const res = await fetch("/api/universities/");
    const data = await res.json();
    setUniversities(data);
  }

  async function loadCompareData() {
    const promises = selectedIds.map((id) =>
      fetch(`/api/universities/${id}/`).then((r) => r.json())
    );
    const data = await Promise.all(promises);
    setCompareData(data);
  }

  function toggleSelect(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
    
    // Actualizar URL
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setSearchParams({ ids: newIds.join(",") });
  }

  return (
    <section className="container">
      <div className="card">
        <h1 className="section-title">Comparar universidades</h1>
        <p className="section-sub">
          Seleccioná hasta 3 universidades para comparar lado a lado
        </p>

        {/* Selector */}
        {compareData.length === 0 && (
          <div className="selector-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar universidad..."
                className="search-input"
              />
            </div>

            <div className="universities-grid">
              {universities.slice(0, 12).map((uni) => (
                <div
                  key={uni.id}
                  className={`uni-select-card ${selectedIds.includes(uni.id) ? "selected" : ""}`}
                  onClick={() => toggleSelect(uni.id)}
                >
                  <img src={uni.photos[0]} alt={uni.name} />
                  <div className="uni-name">{uni.name}</div>
                  <div className="uni-country">{uni.country}</div>
                  {selectedIds.includes(uni.id) && (
                    <div className="selected-badge">✓</div>
                  )}
                </div>
              ))}
            </div>

            {selectedIds.length >= 2 && (
              <button className="btn primary large" onClick={loadCompareData}>
                Comparar {selectedIds.length} universidades
              </button>
            )}
          </div>
        )}

        {/* Tabla Comparativa */}
        {compareData.length > 0 && (
          <div className="comparison-table">
            <button
              className="btn ghost mb-24"
              onClick={() => {
                setCompareData([]);
                setSelectedIds([]);
                setSearchParams({});
              }}
            >
              ← Elegir otras universidades
            </button>

            <div className="compare-grid">
              {compareData.map((uni) => (
                <div key={uni.id} className="compare-column">
                  <img src={uni.photos[0]} alt={uni.name} className="compare-image" />
                  <h3 className="compare-name">{uni.name}</h3>

                  <div className="compare-stats">
                    <div className="compare-stat">
                      <div className="label">Ranking QS</div>
                      <div className="value">{uni.qs_rating_top}</div>
                    </div>
                    {/* ... más stats */}
                  </div>

                  <Link to={`/universities/${uni.id}`} className="btn primary">
                    Ver detalle
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Estilos específicos */
        .selector-section {
          margin-top: 32px;
        }

        .uni-select-card {
          cursor: pointer;
          transition: all var(--transition-base);
          position: relative;
        }

        .uni-select-card.selected {
          border-color: var(--um-blue-500);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .selected-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          background: var(--um-blue-600);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .compare-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .compare-column {
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          background: var(--gray-50);
        }

        .compare-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .compare-name {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--um-blue-900);
        }

        .compare-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .compare-stat {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: white;
          border-radius: 8px;
        }
      `}</style>
    </section>
  );
}