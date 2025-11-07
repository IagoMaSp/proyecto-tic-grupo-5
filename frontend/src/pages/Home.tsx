import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Coverflow from "../components/universities/Coverflow";

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
    </div>
  );
}