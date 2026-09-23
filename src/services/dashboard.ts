import { apiRequest } from "@/services/api";

import type {
  DashboardFilter,
  DashboardKpis,
  RegistrationTrendResponse,
  ConversionFunnelResponse,
  DashboardDemographics,
  DashboardProvincePerformance,
  DashboardAgeGroups,
} from "@/types/dashboard-api";

const BASE_PATH = "/api/v1/dashboard";

// Dashboard filters

function createFilterParams(
  filter: DashboardFilter,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filter.contestId !== undefined) {
    params.set("contestId", String(filter.contestId));
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

// Overview KPIs

export async function getDashboardKpis(
  filter: DashboardFilter = {},
): Promise<DashboardKpis> {
  return apiRequest<DashboardKpis>(
    createDashboardEndpoint("/kpis", filter),
  );
}

// Registration trend

export async function getRegistrationTrend(
  filter: DashboardFilter = {},
): Promise<RegistrationTrendResponse> {
  return apiRequest<RegistrationTrendResponse>(
    createDashboardEndpoint("/registration-trend", filter),
  );
}

// Conversion funnel

export async function getConversionFunnel(
  filter: DashboardFilter = {},
): Promise<ConversionFunnelResponse> {
  return apiRequest<ConversionFunnelResponse>(
    createDashboardEndpoint("/conversion-funnel", filter),
  );
}


// Demographics

export async function getDashboardDemographics(
  filter: DashboardFilter = {},
): Promise<DashboardDemographics> {
  return apiRequest<DashboardDemographics>(
    createDashboardEndpoint("/demographics", filter),
  );
}

// Province-level participation, with the shared dashboard filters
export async function getProvinceParticipation(
  filter: DashboardFilter = {},
): Promise<DashboardProvincePerformance[]> {
  return apiRequest<DashboardProvincePerformance[]>(
    createDashboardEndpoint("/province-participation", filter),
  );
}

// Age-group counts: this endpoint does not accept dashboard date filters
export async function getAgeGroups(): Promise<DashboardAgeGroups> {
  return apiRequest<DashboardAgeGroups>(`${BASE_PATH}/age-groups`);
}
