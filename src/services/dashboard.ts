import { apiRequest } from "@/services/api";

import type {
  DashboardAgeGroups,
  DashboardDemographics,
  DashboardFilter,
  DashboardKpis,
  DashboardProvincePerformance,
  DashboardRevenueResponse,
  DashboardTopPartnersResponse,
  RegistrationTrendResponse,
  ConversionFunnelResponse,
} from "@/types/dashboard-api";

const BASE_PATH = "/api/v1/dashboard";

function createFilterParams(filter: DashboardFilter): URLSearchParams {
  const params = new URLSearchParams();

  if (filter.contestId) {
    params.set("contestId", filter.contestId);
  }

  if (filter.from) {
    params.set("from", filter.from);
  }

  if (filter.to) {
    params.set("to", filter.to);
  }

  if (filter.saleId !== undefined) {
    params.set("saleId", String(filter.saleId));
  }

  return params;
}

function createDashboardEndpoint(
  path: string,
  filter: DashboardFilter,
): string {
  const query = createFilterParams(filter).toString();
  return `${BASE_PATH}${path}${query ? `?${query}` : ""}`;
}

export async function getDashboardKpis(
  filter: DashboardFilter = {},
): Promise<DashboardKpis> {
  return apiRequest<DashboardKpis>(
    createDashboardEndpoint("/kpis", filter),
  );
}

export async function getRegistrationTrend(
  filter: DashboardFilter = {},
): Promise<RegistrationTrendResponse> {
  return apiRequest<RegistrationTrendResponse>(
    createDashboardEndpoint("/registration-trend", filter),
  );
}

export async function getConversionFunnel(
  filter: DashboardFilter = {},
): Promise<ConversionFunnelResponse> {
  return apiRequest<ConversionFunnelResponse>(
    createDashboardEndpoint("/conversion-funnel", filter),
  );
}

export async function getDashboardDemographics(
  filter: DashboardFilter = {},
): Promise<DashboardDemographics> {
  return apiRequest<DashboardDemographics>(
    createDashboardEndpoint("/demographics", filter),
  );
}

export async function getProvinceParticipation(
  filter: DashboardFilter = {},
): Promise<DashboardProvincePerformance[]> {
  return apiRequest<DashboardProvincePerformance[]>(
    createDashboardEndpoint("/province-participation", filter),
  );
}

export async function getAgeGroups(): Promise<DashboardAgeGroups> {
  return apiRequest<DashboardAgeGroups>(`${BASE_PATH}/age-groups`);
}

export async function getDashboardRevenue(
  filter: DashboardFilter = {},
): Promise<DashboardRevenueResponse> {
  return apiRequest<DashboardRevenueResponse>(
    createDashboardEndpoint("/revenue", filter),
  );
}

export async function getTopPartners(
  filter: DashboardFilter = {},
  limit = 50,
): Promise<DashboardTopPartnersResponse> {
  const params = createFilterParams(filter);
  params.set("limit", String(limit));

  return apiRequest<DashboardTopPartnersResponse>(
    `${BASE_PATH}/top-partners?${params.toString()}`,
  );
}
