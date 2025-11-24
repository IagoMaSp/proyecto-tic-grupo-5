import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/authContext";
import type { ReactNode } from "react";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail"; // ⬅️ AGREGAR ESTE IMPORT
import Compare from "./pages/Compare";
import Reviews from "./pages/Reviews";
import About from "./pages/About";
import LogIn from "./pages/LogIn";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/Profile.tsx";

// Componente para proteger rutas
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="card loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
  }
  
  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "universities", element: <Universities /> },
      { path: "universities/:id", element: <UniversityDetail /> },
      { path: "compare", element: <Compare /> },
      { path: "reviews", element: <Reviews /> },
      { path: "about", element: <About /> },
      { path: "login", element: <LogIn /> },
      { path: "register", element: <Register /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}