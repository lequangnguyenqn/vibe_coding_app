export type ManagedUser = {
  id: number;
  username: string;
  full_name: string | null;
  email: string | null;
  sex: string | null;
  birthday: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type UserListResponse = {
  items: ManagedUser[];
  total: number;
  page: number;
  page_size: number;
};

export type UserPayload = {
  username?: string;
  password?: string;
  full_name?: string;
  email?: string;
  sex?: string;
  birthday?: string;
  role?: string;
  is_active?: boolean;
};
