import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}