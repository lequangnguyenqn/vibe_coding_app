import { FoodItem, FoodItemRequest, FoodItemsResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

function buildHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function fetchFoodItems(
  token: string,
  page: number,
  pageSize: number,
  search: string
): Promise<FoodItemsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize)
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(`${API_BASE_URL}/food-items?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load food items");
  }

  return (await response.json()) as FoodItemsResponse;
}

export async function createFoodItem(token: string, payload: FoodItemRequest): Promise<FoodItem> {
  const response = await fetch(`${API_BASE_URL}/food-items`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 409 || body.detail === "duplicate_food_item") {
      throw new Error("An item with this name already exists.");
    }
    throw new Error("Unable to create food item");
  }

  return (await response.json()) as FoodItem;
}

export async function updateFoodItem(token: string, id: number, payload: FoodItemRequest): Promise<FoodItem> {
  const response = await fetch(`${API_BASE_URL}/food-items/${id}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 409 || body.detail === "duplicate_food_item") {
      throw new Error("An item with this name already exists.");
    }
    throw new Error("Unable to update food item");
  }

  return (await response.json()) as FoodItem;
}

export async function deleteFoodItem(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/food-items/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to delete food item");
  }
}
