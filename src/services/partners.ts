
import { apiRequest } from "@/services/api";

import type {
  PartnerFilter,
  PartnerPage,
  PartnerResponse,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from "@/types/partner-api";

const BASE_PATH = "/api/v1/doi-tac";

// Get partners

export async function getPartners(
  filter: PartnerFilter = {},
): Promise<PartnerPage> {
  const params = new URLSearchParams();

  params.set("page", String(filter.page ?? 0));
  params.set("size", String(filter.size ?? 10));

  if (filter.keyword?.trim()) {
    params.set("keyword", filter.keyword.trim());
  }

  if (filter.phanLoai) {
    params.set("phanLoai", filter.phanLoai);
  }

  if (filter.sortBy) {
    params.set("sortBy", filter.sortBy);
  }

  if (filter.sortDir && filter.sortBy) {
    params.set("sortDir", filter.sortDir);
  }

  return apiRequest<PartnerPage>(
    `${BASE_PATH}?${params.toString()}`,
  );
}

// Get partner classifications

export async function getPartnerClassifications(): Promise<string[]> {
  return apiRequest<string[]>(
    `${BASE_PATH}/phan-loai`,
  );
}

// Get partner details

export async function getPartner(
  id: number,
): Promise<PartnerResponse> {
  return apiRequest<PartnerResponse>(
    `${BASE_PATH}/${id}`,
  );
}

// Create partner

export async function createPartner(
  values: CreatePartnerRequest,
): Promise<PartnerResponse> {
  return apiRequest<PartnerResponse>(
    BASE_PATH,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );
}

// Update partner

export async function updatePartner(
  id: number,
  values: UpdatePartnerRequest,
): Promise<PartnerResponse> {
  return apiRequest<PartnerResponse>(
    `${BASE_PATH}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );
}

// Delete partner

export async function deletePartner(
  id: number,
): Promise<void> {
  await apiRequest<void>(
    `${BASE_PATH}/${id}`,
    {
      method: "DELETE",
    },
  );
}
