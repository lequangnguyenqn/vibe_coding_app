import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "../auth/AuthContext";
import { LoginPage } from "./LoginPage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: null, pathname: "/login" })
  };
});

function renderLoginPage() {
  navigateMock.mockReset();

  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("LoginPage", () => {
  it("shows validation message when fields are missing", async () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/please enter your username and password/i)).toBeInTheDocument();
  });

  it("navigates to admin after successful login", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          access_token: "token",
          token_type: "bearer",
          user: { id: 1, username: "admin", role: "admin" }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    ) as typeof fetch;

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/admin", { replace: true });
    });

    global.fetch = originalFetch;
  });
});
