import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!username || !password) {
      setErrorMessage("Please enter your username and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await auth.login(username, password);
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(destination ?? "/admin", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 md:px-12">
      <section className="clay-card mx-auto w-full max-w-md rounded-[32px] p-8">
        <h1 className="text-3xl font-black text-[#163245]">Sign in</h1>
        <p className="mt-2 text-[#27465a]">Use admin/password or user/password.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-semibold text-[#27465a]" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="w-full rounded-2xl border border-[#b9d7e8] bg-white px-4 py-3 text-[#123147] shadow-inner outline-none focus:border-[#0b4f67]"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
          />

          <label className="block text-sm font-semibold text-[#27465a]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-2xl border border-[#b9d7e8] bg-white px-4 py-3 text-[#123147] shadow-inner outline-none focus:border-[#0b4f67]"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />

          {errorMessage ? <p className="text-sm font-semibold text-[#922]">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="clay-button w-full rounded-[22px] px-5 py-3 text-base font-bold text-[#17364a] disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link to="/" className="mt-5 inline-block text-sm font-semibold text-[#0b4f67] underline">
          Back to home
        </Link>
      </section>
    </main>
  );
}
