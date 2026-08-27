import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { createUser, fetchUsers, updateUser, updateUserActiveState } from "../users/api";
import { ManagedUser } from "../users/types";

type FormState = {
  username: string;
  password: string;
  full_name: string;
  email: string;
  sex: string;
  birthday: string;
  role: string;
  is_active: boolean;
};

const PAGE_SIZE = 8;

const initialForm: FormState = {
  username: "",
  password: "",
  full_name: "",
  email: "",
  sex: "",
  birthday: "",
  role: "user",
  is_active: true
};

export function UserManagementPage() {
  const auth = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  async function loadUsers(currentPage: number) {
    if (!auth.token) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers(auth.token, currentPage, PAGE_SIZE, roleFilter, activeFilter);
      setUsers(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers(page);
  }, [auth.token, page, roleFilter, activeFilter]);

  function resetForm() {
    setEditingUser(null);
    setForm(initialForm);
    setFormError(null);
  }

  function startEdit(user: ManagedUser) {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: "",
      full_name: user.full_name ?? "",
      email: user.email ?? "",
      sex: user.sex ?? "",
      birthday: user.birthday ?? "",
      role: user.role,
      is_active: user.is_active
    });
    setFormError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth.token) {
      return;
    }

    if (!form.username.trim()) {
      setFormError("Username is required.");
      return;
    }
    if (!editingUser && !form.password.trim()) {
      setFormError("Password is required for new users.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingUser) {
        await updateUser(auth.token, editingUser.id, {
          username: form.username.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          sex: form.sex.trim(),
          birthday: form.birthday || undefined,
          role: form.role,
          is_active: form.is_active,
          password: form.password.trim() || undefined
        });
      } else {
        await createUser(auth.token, {
          username: form.username.trim(),
          password: form.password.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          sex: form.sex.trim(),
          birthday: form.birthday || undefined,
          role: form.role,
          is_active: form.is_active
        });
      }

      resetForm();
      await loadUsers(page);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save user");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(user: ManagedUser) {
    if (!auth.token) {
      return;
    }

    try {
      await updateUserActiveState(auth.token, user.id, !user.is_active);
      await loadUsers(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update active state");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[#111827]">User Management</h2>
        <p className="mt-1 text-sm text-[#5f6f82]">Admin-only controls for creating and maintaining users.</p>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[#1b2734]">{editingUser ? "Edit User" : "Create User"}</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
          <input
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="Username"
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />
          <input
            value={form.password}
            type="password"
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder={editingUser ? "New password (optional)" : "Password"}
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />
          <select
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>

          <input
            value={form.full_name}
            onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
            placeholder="Full name"
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />
          <input
            value={form.sex}
            onChange={(event) => setForm((current) => ({ ...current, sex: event.target.value }))}
            placeholder="Sex"
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />

          <input
            type="date"
            value={form.birthday}
            onChange={(event) => setForm((current) => ({ ...current, birthday: event.target.value }))}
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />

          <label className="flex items-center gap-2 rounded-xl border border-[#cfd8e3] px-3 py-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            Active user
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#0f766e] px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {editingUser ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[#cfd8e3] px-4 py-2 font-semibold"
            >
              Clear
            </button>
          </div>
        </form>

        {formError ? <p className="mt-3 text-sm font-semibold text-[#b42318]">{formError}</p> : null}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select
            value={roleFilter}
            onChange={(event) => {
              setPage(1);
              setRoleFilter(event.target.value);
            }}
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          >
            <option value="">All roles</option>
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>

          <select
            value={activeFilter}
            onChange={(event) => {
              setPage(1);
              setActiveFilter(event.target.value);
            }}
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          >
            <option value="">All statuses</option>
            <option value="true">active</option>
            <option value="false">inactive</option>
          </select>
        </div>

        {loading ? <p className="text-sm text-[#5f6f82]">Loading users...</p> : null}
        {error ? <p className="text-sm font-semibold text-[#b42318]">{error}</p> : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#dde7f0] text-[#607489]">
                  <th className="py-2 pr-4 font-bold">Username</th>
                  <th className="py-2 pr-4 font-bold">Full Name</th>
                  <th className="py-2 pr-4 font-bold">Email</th>
                  <th className="py-2 pr-4 font-bold">Role</th>
                  <th className="py-2 pr-4 font-bold">Active</th>
                  <th className="py-2 pr-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#edf2f7]">
                    <td className="py-3 pr-4 font-semibold">{user.username}</td>
                    <td className="py-3 pr-4">{user.full_name ?? "-"}</td>
                    <td className="py-3 pr-4">{user.email ?? "-"}</td>
                    <td className="py-3 pr-4">{user.role}</td>
                    <td className="py-3 pr-4">{user.is_active ? "yes" : "no"}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="rounded-lg border border-[#cfd8e3] px-3 py-1 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void toggleActive(user)}
                          className="rounded-lg bg-[#4b70e2] px-3 py-1 font-semibold text-white"
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-5 text-center text-[#5f6f82]">
                      No users found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[#607489]">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-xl border border-[#cfd8e3] px-4 py-2 font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-xl border border-[#cfd8e3] px-4 py-2 font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
