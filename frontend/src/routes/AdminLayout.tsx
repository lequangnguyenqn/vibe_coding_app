import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const navLinkBase = "block w-full rounded-xl px-4 py-3 text-left font-semibold transition-colors";

export function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function onLogout() {
    auth.logout();
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-[#edf5ff] text-[#1f2a37]">
      <div className="flex min-h-screen">
        <aside
          className={`bg-white shadow-xl transition-all duration-200 ${isSidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}
          aria-label="Admin sidebar"
        >
          <div className="border-b border-[#dde7f0] px-6 py-5">
            <h2 className="text-xl font-extrabold">TailAdmin Board</h2>
          </div>
          <nav className="space-y-2 p-4">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? "bg-[#4b70e2] text-white" : "text-[#364152] hover:bg-[#eff4ff]"}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/food-tracker"
              className={({ isActive }) =>
                `${navLinkBase} ${isActive ? "bg-[#4b70e2] text-white" : "text-[#364152] hover:bg-[#eff4ff]"}`
              }
            >
              Food Tracker
            </NavLink>
            {auth.user?.role === "admin" ? (
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `${navLinkBase} ${isActive ? "bg-[#4b70e2] text-white" : "text-[#364152] hover:bg-[#eff4ff]"}`
                }
              >
                User Management
              </NavLink>
            ) : null}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-[#dce6f0] bg-white px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button
                className="rounded-xl border border-[#d1dbe6] bg-white px-3 py-2 font-semibold"
                onClick={() => setIsSidebarOpen((current) => !current)}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
              <h1 className="text-lg font-extrabold md:text-2xl">Admin Dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link className="rounded-xl bg-[#4b70e2] px-4 py-2 font-semibold text-white" to="/">
                Go to Home
              </Link>
              <button className="rounded-xl bg-[#0f766e] px-4 py-2 font-semibold text-white" onClick={onLogout}>
                Logout
              </button>
            </div>
          </header>

          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}
