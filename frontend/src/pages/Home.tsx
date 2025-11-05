import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Coverflow from "../components/Coverflow";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    document.title = "UM Exchange | Inicio";
    // Trigger animations after mount
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  // Placeholder: 10 destinos destacados
  const topDestinations = [
    { 
      src: "https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1600&auto=format&fit=crop",
      title: "Universidad Autónoma de Madrid",
      subtitle: "Madrid, España"
    },
    { 
      src: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1600&auto=format&fit=crop",
      title: "Pontificia Universidad Católica de Chile",
      subtitle: "Santiago, Chile"
    },
    { 
      src: "https://images.unsplash.com/photo-1473959383410-a26507b602cc?q=80&w=1600&auto=format&fit=crop",
      title: "Universidade Nova de Lisboa",
      subtitle: "Lisboa, Portugal"
    },
    { 
      src: "https://images.unsplash.com/photo-1488747279002-c8523379faaa?q=80&w=1600&auto=format&fit=crop",
      title: "Universidad de Navarra",
      subtitle: "Pamplona, España"
    },
    { 
      src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
      title: "Università di Bologna",
      subtitle: "Boloña, Italia"
    },
    { 
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop",
      title: "Universität Wien",
      subtitle: "Viena, Austria"
    },
    { 
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop",
      title: "Universidad del Salvador",
      subtitle: "Buenos Aires, Argentina"
    },
    { 
      src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
      title: "Universidad de los Andes",
      subtitle: "Bogotá, Colombia"
    },
    { 
      src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop",
      title: "Maastricht University",
      subtitle: "Maastricht, Países Bajos"
    },
    { 
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      title: "The University of Queensland",
      subtitle: "Brisbane, Australia"
    },
  ];

  const features = [
    {
      icon: "🔍",
      title: "Exploración inteligente",
      description: "Buscá por país, ranking QS, idioma y requisitos académicos. Guardá tus universidades favoritas y creá tu lista personalizada.",
    },
    {
      icon: "⚖️",
      title: "Comparación detallada",
      description: "Comparar hasta 3 universidades lado a lado: ranking QS, costo de vida, infraestructura, clima y vida social.",
    },
    {
      icon: "⭐",
      title: "Experiencias verificadas",
      description: "Leé reseñas auténticas de alumnos UM organizadas por semestre, carrera y promedio para saber exactamente qué esperar.",
    },
  ];

  const stats = [
    { value: "70+", label: "Universidades" },
    { value: "40+", label: "Países" },
    { value: "100+", label: "Reseñas" },
  ];

  return (
    <div className={`home-container ${isVisible ? "visible" : ""}`}>
      {/* HERO SECTION */}
      <section className="hero-full">
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content">
            <div className="kicker">Universidad de Montevideo</div>
            <h1 className="headline">
              Encontrá tu intercambio ideal
            </h1>
            <p className="sub">
              Indagá en las Universidades con convenio con la Universidad de Montevideo.
              Leé experiencias reales de alumnos UM y decidí con información actualizada.
            </p>
            
            <div className="cta-row">
              <Link to="/universities" className="btn primary">
                <span>Explorar universidades</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link to="/compare" className="btn ghost">
                <span>Comparar destinos</span>
              </Link>
            </div>

            <ul className="bullets">
              <li>Filtros avanzados por país, facultad, ranking QS y valoraciones de alumnos</li>
              <li>Comparaciones detalladas lado a lado</li>
              <li>Reseñas de alumnos que ya vivieron el intercambio</li>
            </ul>
          </div>

          {/* Stats mini cards */}
          <div className="stats-row">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COVERFLOW SECTION */}
      <section className="container">
        <div className="section-header">
          <h2 className="section-title">Top destinos de intercambio UM</h2>
          <p className="section-sub">
            Descubrí las universidades más elegidas y mejor valoradas por alumnos UM.
          </p>
        </div>
        <Coverflow items={topDestinations} autoPlayMs={3500} />
      </section>

      {/* FEATURES SECTION */}
      <section className="container">
        <div className="card features-card">
          <div className="section-header text-center">
            <h2 className="section-title">Todo lo que necesitás para decidir</h2>
            <p className="section-sub">
              Una plataforma completa diseñada por alumnos UM, para alumnos UM.
            </p>
          </div>

          <div className="features">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <div className="t">{feature.title}</div>
                  <div className="d">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="container">
        <div className="cta-card">
          <div className="cta-content">
            <h2 className="cta-title">¿Listo para tu intercambio?</h2>
            <p className="cta-text">
              Comenzá a explorar las mejores universidades con convenio UM
            </p>
            <Link to="/universities" className="btn primary large">
              Ver todas las universidades
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .home-container {
          opacity: 0;
          transition: opacity 0.6s ease-out;
        }

        .home-container.visible {
          opacity: 1;
        }

        /* Hero Section */
        .hero-full {
          position: relative;
          margin-bottom: 80px;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 70% 70%, rgba(31, 94, 209, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero-content {
          max-width: 720px;
          position: relative;
          z-index: 2;
        }

        .hero-full .btn-arrow {
          display: inline-block;
          transition: transform var(--transition-base);
        }

        .hero-full .btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 600px;
          margin-top: 48px;
          position: relative;
          z-index: 2;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          box-shadow: var(--shadow-sm);
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          transition: all var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--um-blue-200);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 900;
          color: var(--um-blue-700);
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--muted);
          font-weight: 600;
        }

        /* Section Header */
        .section-header {
          margin-bottom: 32px;
        }

        .section-header.text-center {
          text-align: center;
          max-width: 640px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Features Card */
        .features-card {
          background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          position: relative;
          overflow: hidden;
        }

        .features-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .features {
          position: relative;
          z-index: 1;
        }

        .feature {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .feature-icon {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--um-blue-50), var(--um-blue-100));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          transition: all var(--transition-smooth);
        }

        .feature:hover .feature-icon {
          transform: rotate(-5deg) scale(1.1);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
        }

        .feature-content {
          flex: 1;
        }

        /* CTA Card */
        .cta-card {
          background: linear-gradient(135deg, var(--um-blue-700) 0%, var(--um-blue-600) 100%);
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(31, 94, 209, 0.3);
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .cta-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .cta-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 900;
          color: white;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .cta-text {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .btn.large {
          padding: 16px 32px;
          font-size: 1.05rem;
        }

        .cta-card .btn.primary {
          background: white;
          color: var(--um-blue-700);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .cta-card .btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 1.6rem;
          }

          .feature {
            flex-direction: column;
            text-align: center;
            align-items: center;
          }

          .cta-card {
            padding: 40px 24px;
          }
        }

        @media (max-width: 640px) {
          .hero-content {
            max-width: 100%;
          }

          .cta-row {
            flex-direction: column;
            width: 100%;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}