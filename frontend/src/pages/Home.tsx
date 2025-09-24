import { Link } from "react-router-dom";
export default function Home() {
  return (
    <section>
      <h1>UM Exchange</h1>
      <p>Explorá universidades…</p>
      <Link to="/universities" className="underline">
        Empezar a explorar →
      </Link>
    </section>
  );
}
