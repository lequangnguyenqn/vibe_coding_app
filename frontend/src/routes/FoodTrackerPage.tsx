import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { createFoodItem, deleteFoodItem, fetchFoodItems, updateFoodItem } from "../food/api";
import { FoodItem } from "../food/types";

type FormState = {
  name: string;
  expiration_date: string;
};

const PAGE_SIZE = 5;

function toDateInputValue(value: string): string {
  return value.slice(0, 10);
}

export function FoodTrackerPage() {
  const auth = useAuth();

  const [items, setItems] = useState<FoodItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({ name: "", expiration_date: "" });
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDeleteItem, setConfirmDeleteItem] = useState<FoodItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    async function load() {
      if (!auth.token) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchFoodItems(auth.token, page, PAGE_SIZE, search);
        setItems(response.items);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load food items");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [auth.token, page, search]);

  function resetForm() {
    setEditingItem(null);
    setForm({ name: "", expiration_date: "" });
    setFormError(null);
  }

  function startEdit(item: FoodItem) {
    setEditingItem(item);
    setForm({
      name: item.name,
      expiration_date: toDateInputValue(item.expiration_date)
    });
    setFormError(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!auth.token) {
      return;
    }

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setFormError("Name is required.");
      return;
    }

    if (!form.expiration_date) {
      setFormError("Expiration date is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingItem) {
        await updateFoodItem(auth.token, editingItem.id, {
          name: trimmedName,
          expiration_date: form.expiration_date
        });
      } else {
        await createFoodItem(auth.token, {
          name: trimmedName,
          expiration_date: form.expiration_date
        });
      }

      resetForm();
      const response = await fetchFoodItems(auth.token, page, PAGE_SIZE, search);
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save item");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!auth.token || !confirmDeleteItem) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFoodItem(auth.token, confirmDeleteItem.id);
      setConfirmDeleteItem(null);

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      const response = await fetchFoodItems(auth.token, nextPage, PAGE_SIZE, search);
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete item");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111827]">Food Tracker</h2>
            <p className="text-sm text-[#5f6f82]">Track expirations and receive daily alert digests.</p>
          </div>

          <form
            className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput);
            }}
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name"
              className="rounded-xl border border-[#cfd8e3] px-3 py-2"
            />
            <button className="rounded-xl bg-[#4b70e2] px-4 py-2 font-semibold text-white" type="submit">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[#1b2734]">{editingItem ? "Edit Food Item" : "Add Food Item"}</h3>

        <form className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_auto_auto]" onSubmit={onSubmit}>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Item name"
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />
          <input
            type="date"
            value={form.expiration_date}
            onChange={(event) => setForm((current) => ({ ...current, expiration_date: event.target.value }))}
            className="rounded-xl border border-[#cfd8e3] px-3 py-2"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#0f766e] px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {editingItem ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-[#cfd8e3] bg-white px-4 py-2 font-semibold"
          >
            Clear
          </button>
        </form>

        {formError && <p className="mt-3 text-sm font-semibold text-[#b42318]">{formError}</p>}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        {isLoading ? <p className="text-sm text-[#5f6f82]">Loading items...</p> : null}
        {error ? <p className="text-sm font-semibold text-[#b42318]">{error}</p> : null}

        {!isLoading && !error ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#dde7f0] text-[#607489]">
                  <th className="py-2 pr-4 font-bold">Name</th>
                  <th className="py-2 pr-4 font-bold">Expiration Date</th>
                  <th className="py-2 pr-4 font-bold">Status</th>
                  <th className="py-2 pr-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#edf2f7]">
                    <td className="py-3 pr-4 font-semibold">{item.name}</td>
                    <td className="py-3 pr-4">{toDateInputValue(item.expiration_date)}</td>
                    <td className="py-3 pr-4">
                      {item.is_expired
                        ? `Expired ${Math.abs(item.days_until_expiration)} day(s) ago`
                        : `${item.days_until_expiration} day(s) remaining`}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-[#cfd8e3] px-3 py-1 font-semibold"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg bg-[#b42318] px-3 py-1 font-semibold text-white"
                          onClick={() => setConfirmDeleteItem(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-5 text-center text-[#5f6f82]">
                      No items found.
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

      {confirmDeleteItem ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f172acc] px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-[#111827]">Delete Food Item</h4>
            <p className="mt-2 text-sm text-[#5f6f82]">
              Are you sure you want to delete <strong>{confirmDeleteItem.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteItem(null)}
                className="rounded-xl border border-[#cfd8e3] px-4 py-2 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
                className="rounded-xl bg-[#b42318] px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
