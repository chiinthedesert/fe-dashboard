import { apiRequest } from "@/services/api";
import { useAuth } from "@/composables/useAuth";

import type {
  UpdateCandidateRequest,
  CandidateResponse,
  CandidateFilter,
  CandidatePage,
  CreateCandidateRequest,
  StaffOptionResponse,
} from "@/types/candidate-api";

const BASE_PATH = "/api/v1/thi-sinh";

function createCandidateParams(
  filter: CandidateFilter,
  includePagination = true,
): URLSearchParams {
  const params = new URLSearchParams();

  if (includePagination) {
    params.set("page", String(filter.page ?? 0));
    params.set("size", String(filter.size ?? 10));
  } else {
    if (filter.page !== undefined) {
      params.set("page", String(filter.page));
    }

    if (filter.size !== undefined) {
      params.set("size", String(filter.size));
    }
  }

  if (filter.keyword?.trim()) {
    params.set("keyword", filter.keyword.trim());
  }

  if (filter.truongHoc) {
    params.set("truongHoc", filter.truongHoc);
  }

  if (filter.tinhThanh) {
    params.set("tinhThanh", filter.tinhThanh);
  }

  if (filter.trangThai) {
    params.set("trangThai", filter.trangThai);
  }

  if (filter.nguonDangKy) {
    params.set("nguonDangKy", filter.nguonDangKy);
  }

  if (filter.doiTac) {
    params.set("doiTac", filter.doiTac);
  }

  if (filter.sortBy) {
    params.set("sortBy", filter.sortBy);
  }

  if (filter.sortDir) {
    params.set("sortDir", filter.sortDir);
  }

  return params;
}

export async function getCandidates(
  filter: CandidateFilter = {},
): Promise<CandidatePage> {
  const params = createCandidateParams(filter);

  return apiRequest<CandidatePage>(`${BASE_PATH}?${params.toString()}`);
}

export async function getCandidate(
  id: number,
): Promise<CandidateResponse> {
  return apiRequest<CandidateResponse>(`${BASE_PATH}/${id}`);
}

export async function getCandidateSchools(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE_PATH}/schools`);
}

export async function getCandidateProvinces(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE_PATH}/provinces`);
}

export async function getCandidateSources(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE_PATH}/sources`);
}

export async function getCandidatePartners(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE_PATH}/partners`);
}

export async function getCandidateSales(): Promise<StaffOptionResponse[]> {
  return apiRequest<StaffOptionResponse[]>(`${BASE_PATH}/sales`);
}

export async function createCandidate(
  values: CreateCandidateRequest,
): Promise<CandidateResponse> {
  return apiRequest<CandidateResponse>(BASE_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export async function updateCandidate(
  id: number,
  values: UpdateCandidateRequest,
): Promise<CandidateResponse> {
  return apiRequest<CandidateResponse>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export async function deleteCandidate(id: number): Promise<void> {
  await apiRequest<void>(`${BASE_PATH}/${id}`, {
    method: "DELETE",
  });
}

export async function exportCandidates(
  filter: CandidateFilter = {},
): Promise<Blob> {
  const { accessToken, ensureSession, clearSession } = useAuth();

  if (!ensureSession()) {
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  const token = accessToken.value;

  if (!token) {
    throw new Error("Không tìm thấy access token.");
  }

  const params = createCandidateParams(filter, false);

  const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

  const query = params.toString();
  const endpoint = `${BASE_PATH}/export-excel${query ? `?${query}` : ""}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && accessToken.value === token) {
      clearSession();
    }

    throw new Error(`Không thể xuất file Excel (HTTP ${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    throw new Error("Máy chủ trả về JSON thay vì file Excel.");
  }

  const file = await response.blob();

  if (file.size === 0) {
    throw new Error("File Excel trả về bị rỗng.");
  }

  return file;
}
