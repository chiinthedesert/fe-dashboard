<script setup lang="ts">
import { inject, ref, watch } from "vue";
import type { Ref } from "vue";

import OverviewCards from "@/components/dashboard/OverviewCards.vue";
import RegisChart from "@/components/dashboard/RegisChart.vue";
import ConversionChart from "@/components/dashboard/ConversionChart.vue";
import RevenueChart from "@/components/dashboard/RevenueChart.vue";

import {
  getConversionFunnel,
  getDashboardKpis,
  getDashboardRevenue,
  getRegistrationTrend,
} from "@/services/dashboard";

import type {
  ConversionFunnelResponse,
  DashboardFilter,
  DashboardKpis,
  DashboardRevenueResponse,
  RegistrationTrendResponse,
} from "@/types/dashboard-api";

const dashboardFilter = inject<Ref<DashboardFilter>>("dashboardFilter");

if (!dashboardFilter) {
  throw new Error("Dashboard filter is unavailable.");
}

const kpis = ref<DashboardKpis | null>(null);
const registrationTrend = ref<RegistrationTrendResponse | null>(null);
const conversionFunnel = ref<ConversionFunnelResponse | null>(null);
const revenue = ref<DashboardRevenueResponse | null>(null);

const loading = ref(false);
const kpiError = ref("");
const trendError = ref("");
const funnelError = ref("");
const revenueError = ref("");

watch(
  dashboardFilter,
  async (filter, _, onCleanup) => {
    let cancelled = false;

    onCleanup(() => {
      cancelled = true;
    });

    loading.value = true;
    kpiError.value = "";
    trendError.value = "";
    funnelError.value = "";
    revenueError.value = "";

    try {
      const [kpiResult, trendResult, funnelResult, revenueResult] =
        await Promise.allSettled([
          getDashboardKpis(filter),
          getRegistrationTrend(filter),
          getConversionFunnel(filter),
          getDashboardRevenue(filter),
        ]);

      if (cancelled) return;

      if (kpiResult.status === "fulfilled") {
        kpis.value = kpiResult.value;
      } else {
        kpis.value = null;
        kpiError.value =
          kpiResult.reason instanceof Error
            ? kpiResult.reason.message
            : "Không thể tải chỉ số tổng quan.";
      }

      if (trendResult.status === "fulfilled") {
        registrationTrend.value = trendResult.value;
      } else {
        registrationTrend.value = null;
        trendError.value =
          trendResult.reason instanceof Error
            ? trendResult.reason.message
            : "Không thể tải xu hướng đăng ký.";
      }

      if (funnelResult.status === "fulfilled") {
        conversionFunnel.value = funnelResult.value;
      } else {
        conversionFunnel.value = null;
        funnelError.value =
          funnelResult.reason instanceof Error
            ? funnelResult.reason.message
            : "Không thể tải phễu chuyển đổi.";
      }

      if (revenueResult.status === "fulfilled") {
        revenue.value = revenueResult.value;
      } else {
        revenue.value = null;
        revenueError.value =
          revenueResult.reason instanceof Error
            ? revenueResult.reason.message
            : "Không thể tải dữ liệu doanh thu.";
      }
    } finally {
      if (!cancelled) loading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <section class="min-w-0">
    <p v-if="kpiError" role="alert" class="mb-3 text-sm text-destructive">
      {{ kpiError }}
    </p>

    <OverviewCards :data="kpis" :loading="loading" />
  </section>

  <section class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
    <RegisChart
      :data="registrationTrend"
      :loading="loading"
      :error="trendError"
    />

    <ConversionChart
      :data="conversionFunnel"
      :loading="loading"
      :error="funnelError"
    />
  </section>

  <section class="min-w-0">
    <RevenueChart :data="revenue" :loading="loading" :error="revenueError" />
  </section>
</template>
