import { apiRequest } from "@/services/api";

import type {
  Admin,
  AuthSession,
  LoginCredentials,
} from "@/types/auth";

export type {
  Admin,
  AuthSession,
  LoginCredentials,
} from "@/types/auth";

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
}

// Retrieve the current administrator.
export async function getCurrentAdmin(
  accessToken: string,
): Promise<Admin> {
  const data = await apiRequest<Admin>(
    "/api/v1/admin/current",
    {
      token: accessToken,
    },
  );

  if (!data?.username) {
    throw new Error(
      "Thông tin quản trị viên không hợp lệ.",
    );
  }

  // Only retain the fields needed by the frontend.
  return {
    id: data.id,
    username: data.username,
    hoTen: data.hoTen,
    email: data.email,
    soDienThoai: data.soDienThoai,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// Log in and create a session.
export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const data = await apiRequest<LoginResponse>(
    "/api/v1/auth/login",
    {
      method: "POST",
      auth: false,

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(credentials),
    },
  );

  if (!data?.accessToken) {
    throw new Error(
      "Không nhận được access token từ máy chủ.",
    );
  }

  const {
    accessToken,
    tokenType,
    expiresIn,
  } = data;

  if (
    !Number.isFinite(expiresIn) ||
    expiresIn <= 0
  ) {
    throw new Error(
      "Thời hạn đăng nhập không hợp lệ.",
    );
  }

  const expiresAt = Date.now() + expiresIn;

  const admin = await getCurrentAdmin(accessToken);

  return {
    admin,
    accessToken,
    tokenType: tokenType || "Bearer",
    expiresAt,
  };
}

// Revoke the current JWT on the backend.
export async function logout(
  accessToken: string,
): Promise<void> {
  await apiRequest<void>(
    "/api/v1/auth/logout",
    {
      method: "POST",
      token: accessToken,
    },
  );
}
