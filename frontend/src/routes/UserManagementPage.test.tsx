import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { UserManagementPage } from "./UserManagementPage";

const fetchUsersMock = vi.fn();
const createUserMock = vi.fn();
const updateUserMock = vi.fn();
const updateUserActiveStateMock = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    token: "test-token",
    user: { id: 1, username: "admin", role: "admin" }
  })
}));

vi.mock("../users/api", () => ({
  fetchUsers: (...args: unknown[]) => fetchUsersMock(...args),
  createUser: (...args: unknown[]) => createUserMock(...args),
  updateUser: (...args: unknown[]) => updateUserMock(...args),
  updateUserActiveState: (...args: unknown[]) => updateUserActiveStateMock(...args)
}));

function responseData() {
  return {
    items: [
      {
        id: 9,
        username: "member",
        full_name: "Member User",
        email: "member@example.com",
        sex: "other",
        birthday: "1995-05-10",
        role: "user",
        is_active: true,
        created_at: "2026-08-27T00:00:00Z"
      }
    ],
    total: 1,
    page: 1,
    page_size: 8
  };
}

describe("UserManagementPage", () => {
  beforeEach(() => {
    fetchUsersMock.mockResolvedValue(responseData());
    createUserMock.mockResolvedValue(responseData().items[0]);
    updateUserMock.mockResolvedValue(responseData().items[0]);
    updateUserActiveStateMock.mockResolvedValue({ ...responseData().items[0], is_active: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders users and supports role/active filter API calls", async () => {
    render(<UserManagementPage />);
    expect(await screen.findByText("member")).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("All roles"), { target: { value: "admin" } });

    await waitFor(() => {
      expect(fetchUsersMock).toHaveBeenLastCalledWith("test-token", 1, 8, "admin", "");
    });
  });

  it("validates create form and creates user", async () => {
    render(<UserManagementPage />);
    await screen.findByText("member");

    fireEvent.click(screen.getByRole("button", { name: /^Create$/i }));
    expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: "new_user" } });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /^Create$/i }));

    await waitFor(() => {
      expect(createUserMock).toHaveBeenCalled();
    });
  });

  it("toggles user active state", async () => {
    render(<UserManagementPage />);
    await screen.findByText("member");

    fireEvent.click(screen.getByRole("button", { name: /deactivate/i }));

    await waitFor(() => {
      expect(updateUserActiveStateMock).toHaveBeenCalledWith("test-token", 9, false);
    });
  });
});
