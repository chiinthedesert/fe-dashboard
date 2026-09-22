import { apiRequest } from "@/services/api";
import { logout } from "@/services/auth";
import { useAuth } from "@/composables/useAuth";

import type { AdminProfile, UpdateAdminRequest } from "@/types/admin-api";

// Never retain or expose passwordHash from the backend response.
function publicAdmin(data: AdminProfile): AdminProfile {
  return {
    id: data.id,
    username: data.username,
    hoTen: data.hoTen ?? null,
    email: data.email ?? null,
    soDienThoai: data.soDienThoai ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const admin = await apiRequest<AdminProfile>("/api/v1/admin/current");
  if (!admin?.username) throw new Error("Thông tin admin không hợp lệ.");
  return publicAdmin(admin);
}

// The current update API requires a password even for profile-only changes.
// Verify it against login before re-sending it to the update endpoint.
export async function verifyCurrentPassword(
  username: string,
  password: string,
): Promise<void> {
  const temp = await apiRequest<{ accessToken: string }>("/api/v1/auth/login", {
    auth: false,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const activeToken = useAuth().accessToken.value;
  if (temp?.accessToken && temp.accessToken !== activeToken) {
    // Revoke the temporary verification token, not the active UI session.
    try {
      await logout(temp.accessToken);
    } catch {
      // An unsuccessful cleanup should not expose the temporary token.
    }
  }
}

export async function updateAdminProfile(
  request: UpdateAdminRequest,
): Promise<AdminProfile> {
  const result = await apiRequest<AdminProfile>("/api/v1/admin/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!result?.username) throw new Error("Phản hồi cập nhật admin không hợp lệ.");
  return publicAdmin(result);
}
