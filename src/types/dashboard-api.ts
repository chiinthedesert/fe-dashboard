export interface DashboardFilter {
  contestId?: number;
  from?: string;
  to?: string;
  saleId?: number;
}

export interface RegistrationKpi {
  count: number;
  growthRate: number;
  growthLabel: string;
}

export interface ConversionKpi {
  rate: number;
  deltaRate: number;
  description: string;
}

export interface RevenueKpi {
  amount: number;
  currency: string;
  growthRate: number;
  description: string;
}

export interface LeadFollowUpKpi {
  count: number;
  growthRate: number;
  description: string;
}

export interface TargetGapKpi {
  gap: number;
  gapRate: number;
  description: string;
}

export interface DashboardKpis {
  registration: RegistrationKpi;
  conversion: ConversionKpi;
  revenue: RevenueKpi;
  leadFollowUp: LeadFollowUpKpi;
  targetGap: TargetGapKpi;
}

export interface RegistrationTrendItem {
  date: string;
  registrationCount: number;
}

export interface RegistrationTrendResponse {
  totalDays: number;
  data: RegistrationTrendItem[];
}

export interface ConversionFunnelStage {
  stage: number;
  name: string;
  count: number;
  percentage: number;
}

export interface ConversionFunnelResponse {
  stages: ConversionFunnelStage[];
}


export interface DashboardRegion {
  regionName: string;
  count: number;
  percentage: number;
}

export interface DashboardEducationLevel {
  code: string;
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardDemographics {
  regions: DashboardRegion[];
  educationLevels: DashboardEducationLevel[];
}

// Province-level participation statistics
export interface DashboardProvincePerformance {
  province: string;
  region: string;
  registrations: number;
  confirmedParticipants: number;
  conversionRate: number;
}

// Age-group counts are keyed by the labels returned by the backend.
export type DashboardAgeGroups = Record<string, number>;
