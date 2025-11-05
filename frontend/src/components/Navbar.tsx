import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

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
          <NavLink to="/" end className={({isActive}) => `link ${isActive ? 'active':''}`}>Inicio</NavLink>
          <NavLink to="/universities" className={({isActive}) => `link ${isActive ? 'active':''}`}>Universidades</NavLink>
          <NavLink to="/compare" className={({isActive}) => `link ${isActive ? 'active':''}`}>Comparar</NavLink>
          <NavLink to="/reviews" className={({isActive}) => `link ${isActive ? 'active':''}`}>Reviews</NavLink>
          <NavLink to="/about" className={({isActive}) => `link ${isActive ? 'active':''}`}>Sobre el proyecto</NavLink>
        </div>
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-menu">
                <div className="user-info">
                  {user?.profile.profile_photo_url ? (
                    <img 
                      src={user.profile.profile_photo_url} 
                      alt={user.username}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user?.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user?.username}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Salir
                </button>
              </div>
            </>
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

      <style>{`
        .user-menu {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--gray-50);
          border-radius: 999px;
          border: 1px solid var(--border);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--um-blue-100);
        }

        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--um-blue-600);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          border: 2px solid var(--um-blue-100);
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--ink);
        }

        .btn-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          color: var(--muted);
          text-decoration: none;
          border: 1px solid var(--border);
          border-radius: 999px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-logout:hover {
          background: var(--gray-50);
          color: var(--ink);
          border-color: var(--um-blue-200);
        }

        @media (max-width: 768px) {
          .user-name {
            display: none;
          }

          .user-menu {
            gap: 8px;
          }

          .btn-logout {
            padding: 8px 12px;
          }

          .btn-logout span {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}