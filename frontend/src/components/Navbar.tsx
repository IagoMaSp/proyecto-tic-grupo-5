import { NavLink } from "react-router-dom";

const base = "px-3 py-2 rounded-md text-sm";
export default function Navbar() {
  return (
    <nav className="border-b p-3 flex gap-2">
      <NavLink to="/" className={({isActive})=>`${base} ${isActive?'underline':''}`}>Inicio</NavLink>
      <NavLink to="/universities" className={({isActive})=>`${base} ${isActive?'underline':''}`}>Universidades</NavLink>
      <NavLink to="/compare" className={({isActive})=>`${base} ${isActive?'underline':''}`}>Comparar</NavLink>
      <NavLink to="/reviews" className={({isActive})=>`${base} ${isActive?'underline':''}`}>Reviews</NavLink>
      <NavLink to="/about" className={({isActive})=>`${base} ${isActive?'underline':''}`}>Acerca</NavLink>
    </nav>
  );
}
