import { useEffect } from "react";

export default function About() {
  useEffect(() => { document.title = "UM Exchange | Sobre el proyecto"; }, []);
  return (
    <section className="card">
      <h1 className="page-title">Sobre el proyecto</h1>
      <p className="subtitle">Portal no oficial creado por alumnos UM para alumnos UM.</p>
      <p>Objetivo: centralizar info de intercambio y ayudar a decidir con datos y experiencias.</p>
    </section>
  );
}