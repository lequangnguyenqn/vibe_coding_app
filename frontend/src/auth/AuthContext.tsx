import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { loginRequest } from "./api";
import { AuthUser } from "./types";

type StoredAuth = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AUTH_STORAGE_KEY = "food-tracker-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (parsed.token && parsed.user) {
      return parsed;
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = getStoredAuth();
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [user, setUser] = useState<AuthUser | null>(stored?.user ?? null);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      async login(username: string, password: string) {
        const response = await loginRequest(username, password);
        const nextToken = response.access_token;
        const nextUser = response.user;

        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            token: nextToken,
            user: nextUser
          })
        );
      },
      logout() {
        setToken(null);
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
