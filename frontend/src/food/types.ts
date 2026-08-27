export type FoodItem = {
  id: number;
  name: string;
  expiration_date: string;
  is_expired: boolean;
  days_until_expiration: number;
  created_at: string;
  updated_at: string;
};

export type FoodItemsResponse = {
  items: FoodItem[];
  total: number;
  page: number;
  page_size: number;
};

export type FoodItemRequest = {
  name: string;
  expiration_date: string;
};
