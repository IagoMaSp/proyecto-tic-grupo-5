import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <a href="/">UM Exchange</a>
        </div>
        <div className="menu">
          <NavLink to="/" end className={({isActive}) => `link ${isActive ? 'active':''}`}>Inicio</NavLink>
          <NavLink to="/universities" className={({isActive}) => `link ${isActive ? 'active':''}`}>Universidades</NavLink>
          <NavLink to="/compare" className={({isActive}) => `link ${isActive ? 'active':''}`}>Comparar</NavLink>
          <NavLink to="/reviews" className={({isActive}) => `link ${isActive ? 'active':''}`}>Reviews</NavLink>
          <NavLink to="/about" className={({isActive}) => `link ${isActive ? 'active':''}`}>Sobre el proyecto</NavLink>
        </div>
        <div className="navbar-actions">
          <NavLink to="/login" className="btn-login">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: 6 }}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Ingresar
          </NavLink>
        </div>
      </div>
    </nav>
  );
}