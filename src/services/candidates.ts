import { apiRequest } from "@/services/api";
import { useAuth } from "@/composables/useAuth";

import type {
  UpdateCandidateRequest,
  CandidateResponse,
  CandidateFilter,
  CandidatePage,
  CreateCandidateRequest,
} from "@/types/candidate-api";

const BASE_PATH = "/api/v1/thi-sinh";

export async function getCandidates(
  filter: CandidateFilter = {},
): Promise<CandidatePage> {
  const params = new URLSearchParams();

  params.set("page", String(filter.page ?? 0));
  params.set("size", String(filter.size ?? 10));

  if (filter.keyword?.trim()) {
    params.set("keyword", filter.keyword.trim());
  }

  if (filter.truongHoc) {
    params.set("truongHoc", filter.truongHoc);
  }

  if (filter.trangThai) {
    params.set("trangThai", filter.trangThai);
  }

  if (filter.sortBy) {
    params.set("sortBy", filter.sortBy);
  }

  if (filter.sortDir) {
    params.set("sortDir", filter.sortDir);
  }

  return apiRequest<CandidatePage>(
    `${BASE_PATH}?${params.toString()}`,
  );
}

export async function getCandidateSchools(): Promise<string[]> {
  return apiRequest<string[]>(`${BASE_PATH}/schools`);
}


export async function createCandidate(
  values: CreateCandidateRequest,
): Promise<CandidateResponse> {
  return apiRequest<CandidateResponse>(
    "/api/v1/thi-sinh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );
}


export async function updateCandidate(
  id: number,
  values: UpdateCandidateRequest,
): Promise<CandidateResponse> {
  return apiRequest<CandidateResponse>(
    `/api/v1/thi-sinh/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );
}

export async function deleteCandidate(
  id: number,
): Promise<void> {
  await apiRequest<void>(
    `/api/v1/thi-sinh/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function exportCandidates(
  filter: CandidateFilter = {},
): Promise<Blob> {
  const { accessToken, ensureSession, clearSession } = useAuth();

  if (!ensureSession()) {
    throw new Error(
      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    );
  }

  const token = accessToken.value;

  if (!token) {
    throw new Error("Không tìm thấy access token.");
  }

  // Apply the same filters as the candidate table.
  const params = new URLSearchParams();

  if (filter.keyword?.trim()) {
    params.set("keyword", filter.keyword.trim());
  }

  if (filter.truongHoc) {
    params.set("truongHoc", filter.truongHoc);
  }

  if (filter.trangThai) {
    params.set("trangThai", filter.trangThai);
  }

  const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

  const query = params.toString();

  const endpoint = `/api/v1/thi-sinh/export-excel${query ? `?${query}` : ""
    }`;

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (
      response.status === 401 &&
      accessToken.value === token
    ) {
      clearSession();
    }

    throw new Error(
      `Không thể xuất file Excel (HTTP ${response.status}).`,
    );
  }

  // Prevent downloading an API error response as an Excel file.
  const contentType =
    response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    throw new Error(
      "Máy chủ trả về JSON thay vì file Excel.",
    );
  }

  const file = await response.blob();

  if (file.size === 0) {
    throw new Error("File Excel trả về bị rỗng.");
  }

  return file;
}
