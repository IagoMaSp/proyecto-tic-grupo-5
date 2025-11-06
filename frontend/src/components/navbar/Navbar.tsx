// frontend/src/components/Navbar.tsx (SIMPLIFICADO)
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import UserMenu from "../navbar/UserMenu";

const NAV_LINKS = [
  { path: "/", label: "Inicio", end: true },
  { path: "/universities", label: "Universidades" },
  { path: "/compare", label: "Comparar" },
  { path: "/reviews", label: "Reseñas" },
  { path: "/about", label: "Sobre el proyecto" },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <a href="/">UM Exchange</a>
        </div>
        
        <div className="menu">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) => `link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        
        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
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
          )}
        </div>
      </div>
    </nav>
  );
}