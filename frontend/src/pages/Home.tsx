import { useEffect } from "react";
import { Link } from "react-router-dom";
import Coverflow from "../components/Coverflow";

export default function Home() {
  useEffect(() => { document.title = "UM Exchange | Inicio"; }, []);

  // Placeholder: 10 destinos (después viene del backend)
  const items = [
    { src:"https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1600&auto=format&fit=crop", title:"Universidad Autónoma de Madrid", subtitle:"Madrid, España" },
    { src:"https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1600&auto=format&fit=crop", title:"PUC Chile", subtitle:"Santiago, Chile" },
    { src:"https://images.unsplash.com/photo-1473959383410-a26507b602cc?q=80&w=1600&auto=format&fit=crop", title:"U. Nova de Lisboa", subtitle:"Lisboa, Portugal" },
    { src:"https://images.unsplash.com/photo-1488747279002-c8523379faaa?q=80&w=1600&auto=format&fit=crop", title:"U. de Navarra", subtitle:"Pamplona, España" },
    { src:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop", title:"U. de Bologna", subtitle:"Boloña, Italia" },
    { src:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop", title:"U. de Viena", subtitle:"Viena, Austria" },
    { src:"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop", title:"USAL", subtitle:"Buenos Aires, Argentina" },
    { src:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop", title:"U. de los Andes", subtitle:"Bogotá, Colombia" },
    { src:"https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop", title:"U. de Maastricht", subtitle:"Maastricht, Países Bajos" },
    { src:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop", title:"U. de Queensland", subtitle:"Brisbane, Australia" },
  ];

  return (
    <>
      {/* HERO */}
      {/* HERO FULL-WIDTH (sin bloque) */}
        <section className="hero-full">
          <div className="container">
            <div className="kicker">Universidad de Montevideo</div>
            <h1 className="headline">Encontrá tu intercambio ideal</h1>
            <p className="sub">
              Compará universidades por ranking QS, costo de vida, vida social y seguridad.
              Leé experiencias reales de alumnos UM y decidí con datos actualizados.
            </p>
            <div className="cta-row">
              <Link to="/universities" className="btn primary">Explorar universidades</Link>
              <Link to="/compare" className="btn ghost">Comparar destinos</Link>
            </div>
            <ul className="bullets">
              <li>Filtros por país, idioma y ranking.</li>
              <li>Comparaciones lado a lado.</li>
              <li>Reviews por semestre y promedio.</li>
            </ul>
          </div>
        </section>



      <div style={{height:40}} />

      {/* COVERFLOW TOP DESTINOS */}
      <section className="container">
        <h2 className="section-title">Top destinos de intercambio UM</h2>
        <p className="section-sub">Descubrí las universidades más elegidas por nuestros alumnos.</p>
        <Coverflow items={items} autoPlayMs={2800} />
      </section>

      <div style={{height:40}} />

      {/* FEATURES */}
      <section className="container">
        <div className="card">
          <h2 className="section-title">Todo lo que necesitás</h2>
          <p className="section-sub">Una herramienta hecha por alumnos UM para elegir mejor.</p>

          <div className="features">
            <div className="feature">
              <div className="t">Exploración inteligente</div>
              <div className="d">Buscá por país, ranking QS, idioma y requisitos. Guardá tus favoritas.</div>
            </div>
            <div className="feature">
              <div className="t">Comparación clara</div>
              <div className="d">Poné dos o tres universidades lado a lado: QS, costo de vida, campus, vida social.</div>
            </div>
            <div className="feature">
              <div className="t">Experiencias reales</div>
              <div className="d">Reviews verificadas por semestre, carrera y promedio para saber qué esperar.</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
