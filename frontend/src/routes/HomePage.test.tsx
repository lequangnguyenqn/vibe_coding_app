import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { HomePage } from "./HomePage";

const authState = {
  isAuthenticated: false,
  logout: vi.fn()
};

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => authState
}));

describe("HomePage", () => {
  afterEach(() => {
    authState.logout.mockReset();
  });

  it("renders the title and primary navigation", () => {
    authState.isAuthenticated = false;

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Track food expiry dates/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to admin/i })).toBeInTheDocument();
  });

  it("shows logout button when user is already logged in", () => {
    authState.isAuthenticated = true;

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument();
  });
});
