import type { Admin } from "@/types/auth";

export interface UpdateAdminRequest {
  username: string;
  password: string;
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
}

export type AdminProfile = Admin;
