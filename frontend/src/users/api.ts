import { ManagedUser, UserListResponse, UserPayload } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function fetchUsers(
  token: string,
  page: number,
  pageSize: number,
  role: string,
  active: string
): Promise<UserListResponse> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });

  if (role) {
    params.set("role", role);
  }
  if (active) {
    params.set("active", active);
  }

  const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load users");
  }

  return (await response.json()) as UserListResponse;
}

export async function createUser(token: string, payload: UserPayload): Promise<ManagedUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 409) {
      if (body.detail === "duplicate_username") {
        throw new Error("Username already exists.");
      }
      if (body.detail === "duplicate_email") {
        throw new Error("Email already exists.");
      }
    }
    throw new Error("Unable to create user");
  }

  return (await response.json()) as ManagedUser;
}

export async function updateUser(token: string, userId: number, payload: UserPayload): Promise<ManagedUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Unable to update user");
  }

  return (await response.json()) as ManagedUser;
}

export async function updateUserActiveState(
  token: string,
  userId: number,
  isActive: boolean
): Promise<ManagedUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/active`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ is_active: isActive })
  });

  if (!response.ok) {
    throw new Error("Unable to update user status");
  }

  return (await response.json()) as ManagedUser;
}
