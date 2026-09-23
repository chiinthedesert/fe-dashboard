export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Admin {
  id: number;
  username: string;
  hoTen: string | null;
  email: string | null;
  soDienThoai: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  admin: Admin;
  accessToken: string;
  tokenType: string;
  expiresAt: number;
}
