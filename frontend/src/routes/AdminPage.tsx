import { useEffect, useState } from "react";

import { fetchAdminOverview } from "../auth/api";
import { useAuth } from "../auth/AuthContext";

export function AdminPage() {
  const auth = useAuth();
  const [overviewMessage, setOverviewMessage] = useState("Loading dashboard...");

  useEffect(() => {
    if (!auth.token) {
      return;
    }

    let cancelled = false;
    fetchAdminOverview(auth.token)
      .then((result) => {
        if (!cancelled) {
          setOverviewMessage(result.message);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOverviewMessage("Dashboard is available.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.token]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase text-[#607489]">System status</h2>
        <p className="mt-3 text-2xl font-black text-[#111827]">{overviewMessage}</p>
      </article>
      <article className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase text-[#607489]">Role</h2>
        <p className="mt-3 text-2xl font-black text-[#111827]">{auth.user?.role}</p>
      </article>
      <article className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
        <h2 className="text-sm font-bold uppercase text-[#607489]">Part 4 status</h2>
        <p className="mt-3 text-lg font-black text-[#111827]">Food Tracker module is available in the left menu.</p>
      </article>
      </div>
  );
}
