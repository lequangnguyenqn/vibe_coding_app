import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./styles.css";
import { AuthProvider } from "./auth/AuthContext";
import { AdminLayout } from "./routes/AdminLayout";
import { AdminPage } from "./routes/AdminPage";
import { FoodTrackerPage } from "./routes/FoodTrackerPage";
import { HomePage } from "./routes/HomePage";
import { LoginPage } from "./routes/LoginPage";
import { RequireAdmin } from "./routes/RequireAuth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminPage />
          },
          {
            path: "food-tracker",
            element: <FoodTrackerPage />
          }
        ]
      }
    ],
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
