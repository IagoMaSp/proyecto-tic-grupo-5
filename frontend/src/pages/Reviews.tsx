import { useEffect } from "react";

export default function Reviews() {
  useEffect(() => { document.title = "UM Exchange | Reviews"; }, []);
  return (
    <section className="card">
      <h1 className="page-title">Experiencias de alumnos</h1>
      <p className="subtitle">Testimonios por semestre, promedio, carrera y destino.</p>
      <div>Próximo: formulario para subir review y listado con filtros.</div>
    </section>
  );
}
