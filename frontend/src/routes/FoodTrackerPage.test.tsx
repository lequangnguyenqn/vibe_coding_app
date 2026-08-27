import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FoodTrackerPage } from "./FoodTrackerPage";

const fetchFoodItemsMock = vi.fn();
const createFoodItemMock = vi.fn();
const updateFoodItemMock = vi.fn();
const deleteFoodItemMock = vi.fn();

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    token: "test-token",
    user: { id: 1, username: "admin", role: "admin" }
  })
}));

vi.mock("../food/api", () => ({
  fetchFoodItems: (...args: unknown[]) => fetchFoodItemsMock(...args),
  createFoodItem: (...args: unknown[]) => createFoodItemMock(...args),
  updateFoodItem: (...args: unknown[]) => updateFoodItemMock(...args),
  deleteFoodItem: (...args: unknown[]) => deleteFoodItemMock(...args)
}));

function baseResponse() {
  return {
    items: [
      {
        id: 1,
        name: "Milk",
        expiration_date: "2026-08-30",
        is_expired: false,
        days_until_expiration: 3,
        created_at: "2026-08-27T00:00:00Z",
        updated_at: "2026-08-27T00:00:00Z"
      }
    ],
    total: 1,
    page: 1,
    page_size: 5
  };
}

describe("FoodTrackerPage", () => {
  beforeEach(() => {
    fetchFoodItemsMock.mockResolvedValue(baseResponse());
    createFoodItemMock.mockResolvedValue(baseResponse().items[0]);
    updateFoodItemMock.mockResolvedValue(baseResponse().items[0]);
    deleteFoodItemMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders list and pagination", async () => {
    render(<FoodTrackerPage />);

    expect(await screen.findByText("Milk")).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();

    expect(fetchFoodItemsMock).toHaveBeenCalledWith("test-token", 1, 5, "");
  });

  it("shows custom delete confirmation popup and deletes item", async () => {
    render(<FoodTrackerPage />);
    await screen.findByText("Milk");

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText(/Delete Food Item/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm delete/i }));

    await waitFor(() => {
      expect(deleteFoodItemMock).toHaveBeenCalledWith("test-token", 1);
    });
  });

  it("applies search filter when submitting search", async () => {
    render(<FoodTrackerPage />);
    await screen.findByText("Milk");

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), { target: { value: "mil" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(fetchFoodItemsMock).toHaveBeenLastCalledWith("test-token", 1, 5, "mil");
    });
  });
});
