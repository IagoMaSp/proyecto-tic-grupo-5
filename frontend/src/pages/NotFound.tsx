import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => { document.title = "UM Exchange | 404"; }, []);
  return (
    <section className="card">
      <h1 className="page-title">404 — Página no encontrada</h1>
      <p className="subtitle">La ruta no existe o fue movida.</p>
      <Link className="link active" to="/">Volver al inicio</Link>
    </section>
  );
}
