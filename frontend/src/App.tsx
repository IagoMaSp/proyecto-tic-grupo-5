import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Universities from "./pages/Universities";
import Compare from "./pages/Compare";
import Reviews from "./pages/Reviews";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "universities", element: <Universities /> },
      { path: "compare", element: <Compare /> },
      { path: "reviews", element: <Reviews /> },
      { path: "about", element: <About /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
