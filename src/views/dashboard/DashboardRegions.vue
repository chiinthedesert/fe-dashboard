<script setup lang="ts">
import { inject, ref, watch } from "vue";
import type { Ref } from "vue";

import RegionPieChart from "@/components/dashboard/RegionPieChart.vue";
import RegionTable from "@/components/dashboard/RegionTable.vue";

import {
  getDashboardDemographics,
  getProvinceParticipation,
} from "@/services/dashboard";

import type {
  DashboardFilter,
  DashboardProvincePerformance,
  DashboardRegion,
} from "@/types/dashboard-api";

// Shared dashboard filter
const dashboardFilter = inject<Ref<DashboardFilter>>("dashboardFilter");
if (!dashboardFilter) {
  throw new Error("Dashboard filter is unavailable.");
}

// Regional chart state
const regions = ref<DashboardRegion[]>([]);
const regionsLoading = ref(false);
const regionsError = ref("");

// Province table state
const provinces = ref<DashboardProvincePerformance[]>([]);
const provincesLoading = ref(false);
const provincesError = ref("");

// Each section loads independently, so one API failure does not hide the other.
watch(
  dashboardFilter,
  async (filter, _, onCleanup) => {
    let cancelled = false;
    onCleanup(() => { cancelled = true; });

    regionsLoading.value = true;
    regionsError.value = "";
    try {
      const result = await getDashboardDemographics(filter);
      if (!cancelled) regions.value = result.regions ?? [];
    } catch (error) {
      if (!cancelled) {
        regions.value = [];
        regionsError.value = error instanceof Error ? error.message : "Không thể tải dữ liệu khu vực.";
      }
    } finally {
      if (!cancelled) regionsLoading.value = false;
    }
  },
  { immediate: true },
);

watch(
  dashboardFilter,
  async (filter, _, onCleanup) => {
    let cancelled = false;
    onCleanup(() => { cancelled = true; });

    provincesLoading.value = true;
    provincesError.value = "";
    try {
      const result = await getProvinceParticipation(filter);
      if (!cancelled) provinces.value = result ?? [];
    } catch (error) {
      if (!cancelled) {
        provinces.value = [];
        provincesError.value = error instanceof Error ? error.message : "Không thể tải dữ liệu tỉnh / thành.";
      }
    } finally {
      if (!cancelled) provincesLoading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
    <!-- Regional pie chart -->
    <div
      v-if="regionsLoading"
      class="rounded-xl border bg-card p-6 text-sm text-muted-foreground"
    >
      Đang tải dữ liệu khu vực...
    </div>
    <div
      v-else-if="regionsError"
      role="alert"
      class="rounded-xl border bg-card p-6 text-sm text-destructive"
    >
      {{ regionsError }}
    </div>
    <RegionPieChart v-else :regions="regions" />

    <!-- Province statistics -->
    <RegionTable
      :provinces="provinces"
      :loading="provincesLoading"
      :error="provincesError"
    />
  </div>
</template>
