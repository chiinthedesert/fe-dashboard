import { mockAdmin } from "@/mocks/admin";

interface LoginCredentials {
  email: string;
  password: string;
}

export interface Admin {
  id: string;
  name: string;
  department: string;
}

export async function login(
  credentials: LoginCredentials,
): Promise<Admin> {
  const email = credentials.email.trim().toLowerCase();

  if (
    email !== mockAdmin.email ||
    credentials.password !== mockAdmin.password
  ) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }

  return { ...mockAdmin.profile };
}
