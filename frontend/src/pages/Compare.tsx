import { useEffect } from "react";

export default function Compare() {
  useEffect(() => { document.title = "UM Exchange | Comparar"; }, []);
  return (
    <section className="card">
      <h1 className="page-title">Comparar universidades</h1>
      <p className="subtitle">Seleccioná 2–3 para ver ranking, costos, vida social, etc.</p>
      <div>Próximo: selector + tabla comparativa.</div>
    </section>
  );
}
