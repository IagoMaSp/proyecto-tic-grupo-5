import { Link, useLocation } from "react-router-dom";

export default function NotLoggedInView() {
  const location = useLocation();

  return (
    <div className="not-logged-in-view">
      <p>Tenés que iniciar sesión para dejar tu reseña.</p>
      <Link to="/login" state={{ from: location }} className="btn primary">
        Iniciar sesión
      </Link>
    </div>
  );
}