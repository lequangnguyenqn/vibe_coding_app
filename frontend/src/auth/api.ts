import { LoginResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export async function loginRequest(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  return (await response.json()) as LoginResponse;
}

export async function fetchAdminOverview(token: string): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load admin overview");
  }

  return (await response.json()) as { status: string; message: string };
}
