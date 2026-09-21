
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
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
}

interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function getCurrentAdmin(
  accessToken: string,
): Promise<Admin> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/admin/current`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Không thể lấy thông tin quản trị viên.",
    );
  }

  const result: ApiResponse<Admin> = await response.json();

  if (!result.data?.username) {
    throw new Error(
      "Thông tin quản trị viên không hợp lệ.",
    );
  }

  return result.data;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    },
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Tên đăng nhập hoặc mật khẩu không đúng.",
      );
    }

    throw new Error(
      "Không thể đăng nhập. Vui lòng thử lại.",
    );
  }

  const result: ApiResponse<LoginResponse> = await response.json();

  if (!result.data?.accessToken) {
    throw new Error(
      "Không nhận được access token từ máy chủ.",
    );
  }

  const { accessToken, tokenType } = result.data;

  const admin = await getCurrentAdmin(accessToken);

  return {
    admin,
    accessToken,
    tokenType: tokenType || "Bearer",
  };
}


export async function logout(
  accessToken: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/auth/logout`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Không thể đăng xuất khỏi máy chủ.");
  }
}
