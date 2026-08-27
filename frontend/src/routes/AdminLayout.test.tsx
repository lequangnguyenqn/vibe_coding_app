import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AdminLayout } from "./AdminLayout";

const authState = {
  token: "token",
  user: { id: 1, username: "admin", role: "admin" },
  logout: vi.fn()
};

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => authState
}));

function renderLayout() {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminLayout", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows User Management link for admin role", () => {
    authState.user = { id: 1, username: "admin", role: "admin" };
    renderLayout();

    expect(screen.getByRole("link", { name: /user management/i })).toBeInTheDocument();
  });

  it("hides User Management link for non-admin role", () => {
    authState.user = { id: 2, username: "user", role: "user" };
    renderLayout();

    expect(screen.queryByRole("link", { name: /user management/i })).not.toBeInTheDocument();
  });
});
