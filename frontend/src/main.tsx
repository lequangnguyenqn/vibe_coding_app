import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./styles.css";
import { HomePage } from "./routes/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
