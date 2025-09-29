import { useEffect } from "react";
import Carousel from "../components/Carousel";

export default function Home() {
  useEffect(() => { document.title = "UM Exchange | Inicio"; }, []);

  const imgs = [
    "/images/campus-1.jpg",
    "/images/campus-2.jpg",
    "/images/campus-3.jpg"
  ];

  return (
    <section className="container">
      <div className="card">
        <div className="hero">
          <div>
            <div className="kicker">Universidad de Montevideo</div>
            <h1 className="headline">Elegí tu intercambio<br/>con datos reales.</h1>
            <p className="sub">
              Compará universidades por ranking QS, costo de vida y experiencias de alumnos.
              Un diseño simple, rápido y enfocado.
            </p>
          </div>
          <Carousel images={imgs} />
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <h2 className="page-title">Todo lo que necesitás</h2>
        <p className="subtitle">Explorá, compará y leé reviews antes de decidir.</p>
        <ul>
          <li>🔎 Explorar universidades con filtros inteligentes.</li>
          <li>⚖️ Comparar lado a lado QS, costos y vida social.</li>
          <li>⭐ Reviews verificadas por semestre y promedio.</li>
        </ul>
      </div>
    </section>
  );
}
