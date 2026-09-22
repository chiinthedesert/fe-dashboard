<script setup lang="ts">
import { inject, ref, watch } from "vue";
import type { Ref } from "vue";

import OverviewCards from "@/components/dashboard/OverviewCards.vue";
import RegisChart from "@/components/dashboard/RegisChart.vue";
import ConversionChart from "@/components/dashboard/ConversionChart.vue";

import {
  getDashboardKpis,
  getRegistrationTrend,
  getConversionFunnel,
} from "@/services/dashboard";

import type {
  DashboardFilter,
  DashboardKpis,
  RegistrationTrendResponse,
  ConversionFunnelResponse,
} from "@/types/dashboard-api";

// Dashboard filter

const dashboardFilter = inject<Ref<DashboardFilter>>("dashboardFilter");

if (!dashboardFilter) {
  throw new Error("Dashboard filter is unavailable.");
}

// Dashboard data

const kpis = ref<DashboardKpis | null>(null);

const registrationTrend = ref<RegistrationTrendResponse | null>(null);

const conversionFunnel = ref<ConversionFunnelResponse | null>(null);

// Request state

const loading = ref(false);

const kpiError = ref("");
const trendError = ref("");
const funnelError = ref("");

// Fetch dashboard data

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

    try {
      const [kpiResult, trendResult, funnelResult] = await Promise.allSettled([
        getDashboardKpis(filter),
        getRegistrationTrend(filter),
        getConversionFunnel(filter),
      ]);

      if (cancelled) return;

      // Overview KPIs

      if (kpiResult.status === "fulfilled") {
        kpis.value = kpiResult.value;
      } else {
        kpis.value = null;

        kpiError.value =
          kpiResult.reason instanceof Error
            ? kpiResult.reason.message
            : "Không thể tải chỉ số tổng quan.";
      }

      // Registration trend

      if (trendResult.status === "fulfilled") {
        registrationTrend.value = trendResult.value;
      } else {
        registrationTrend.value = null;

        trendError.value =
          trendResult.reason instanceof Error
            ? trendResult.reason.message
            : "Không thể tải xu hướng đăng ký.";
      }

      // Conversion funnel

      if (funnelResult.status === "fulfilled") {
        conversionFunnel.value = funnelResult.value;
      } else {
        conversionFunnel.value = null;

        funnelError.value =
          funnelResult.reason instanceof Error
            ? funnelResult.reason.message
            : "Không thể tải phễu chuyển đổi.";
      }
    } finally {
      if (!cancelled) {
        loading.value = false;
      }
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
</template>
