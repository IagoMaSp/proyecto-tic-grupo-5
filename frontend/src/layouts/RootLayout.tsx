import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        <Outlet />
      </main>
      <footer className="border-t p-4 text-center text-sm opacity-70">
        © UM Exchange
      </footer>
    </div>
  );
}