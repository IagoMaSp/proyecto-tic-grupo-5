import { useEffect } from "react";

const MOCK = [
  { name: "Universidad Autónoma de Madrid", country: "España", qs: 199 },
  { name: "Pontificia Universidad Católica de Chile", country: "Chile", qs: 89 },
  { name: "Universidade Nova de Lisboa", country: "Portugal", qs: 428 },
];

export default function Universities() {
  useEffect(() => { document.title = "UM Exchange | Universidades"; }, []);
  return (
    <section className="container">
      <div className="card">
        <h1 className="section-title">Universidades con convenio</h1>
        <p className="section-sub">Este listado es de muestra. Luego lo conectamos al backend.</p>

        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(3,minmax(0,1fr))'}}>
          {MOCK.map(u => (
            <div key={u.name} className="feature" style={{padding:20}}>
              <div className="t" style={{marginBottom:8}}>{u.name}</div>
              <div className="d">🇪🇸 {u.country}</div>
              <div className="d" style={{marginTop:8}}><b>QS</b>: {u.qs}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
