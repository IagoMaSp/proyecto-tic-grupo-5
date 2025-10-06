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
      </div>
    </nav>
  );
}
