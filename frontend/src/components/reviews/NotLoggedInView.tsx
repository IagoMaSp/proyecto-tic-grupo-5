import { Link } from "react-router-dom";

export default function NotLoggedInView() {
  return (
    <div className="not-logged-in-view">
      <p>Tenés que iniciar sesión para dejar tu review.</p>
      <Link to="/login" className="btn primary">
        Iniciar sesión
      </Link>
    </div>
  );
}