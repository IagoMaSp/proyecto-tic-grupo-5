import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    document.title = "UM Exchange | Sobre el proyecto";
  }, []);
  
  return (
    <section className="card about-page-card">
      <h1 className="page-title">Sobre UM Exchange</h1>
      <p className="subtitle">
        Una plataforma creada por alumnos, para alumnos.
      </p>

      <div className="about-content">
        <div className="content-block">
          <h2 className="about-title-small">El Problema</h2>
          <p>
            Elegir un destino de intercambio es una de las mejores decisiones de
            la carrera, pero seamos honestos: el proceso puede ser frustrante.
            La información oficial está dispersa, comparar opciones es un
            trabajo manual y es muy difícil saber cómo es <em>realmente</em>{" "}
            cada universidad.
          </p>
          <p>
            <strong>UM Exchange nació de ese problema.</strong> Somos
            estudiantes que, viviendo esa fricción, decidimos construir la
            herramienta que nos hubiese encantado tener.
          </p>
        </div>

        <div className="content-block">
          <h2 className="about-title-small">Nuestra Solución</h2>
          <p>
            Este portal centraliza toda la información en un solo lugar para
            transformar un proceso tedioso en una experiencia eficiente e
            intuitiva. Aquí puedes:
          </p>
          <ul className="feature-list-about">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <strong>Explorar</strong> todas las universidades con convenio.
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <strong>Filtrar</strong> por país, facultad, ranking QS y más.
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M21 3l-7.5 7.5"></path><path d="M3 21l7.5-7.5"></path></svg>
              <strong>Comparar</strong> hasta 3 destinos lado a lado.
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <strong>Leer reseñas</strong> reales de otros alumnos de la UM.
            </li>
          </ul>
        </div>

        <div className="disclaimer-box">
          <h3>Aviso Importante</h3>
          <p>
            <strong>UM Exchange</strong> es una iniciativa estudiantil y{" "}
            <strong>no es un sitio web oficial</strong> de la Universidad de
            Montevideo. La información sobre convenios y universidades se
            recopiló manualmente y podría no estar 100% actualizada o completa.
          </p>
          <p>
            Para consultar la información oficial, verificar los convenios
            vigentes y/o realizar tu postulación, debés dirigirte siempre al
            portal oficial.
          </p>
          <a
            href="https://www.um.edu.uy"
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
          >
            <span>Ir al Portal oficial de la UM</span>
            <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}