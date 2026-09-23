import type { DashboardFilter } from "@/types/dashboard-api";

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLastDaysRange(
  days: number,
): DashboardFilter {
  const today = new Date();

  const start = new Date(today);

  start.setDate(start.getDate() - days + 1);

  return {
    from: formatLocalDate(start),
    to: formatLocalDate(today),
  };
}
