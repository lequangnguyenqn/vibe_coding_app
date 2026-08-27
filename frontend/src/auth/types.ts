export type AuthUser = {
  id: number;
  username: string;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};
