<script setup lang="ts">
import { inject, ref, watch } from "vue";
import type { Ref } from "vue";

import RegionPieChart from "@/components/dashboard/RegionPieChart.vue";
import RegionTable from "@/components/dashboard/RegionTable.vue";

import { getDashboardDemographics } from "@/services/dashboard";

import type { DashboardFilter, DashboardRegion } from "@/types/dashboard-api";

// Dashboard filter

const dashboardFilter = inject<Ref<DashboardFilter>>("dashboardFilter");

if (!dashboardFilter) {
  throw new Error("Dashboard filter is unavailable.");
}

// Regional data

const regions = ref<DashboardRegion[]>([]);

// Request state

const loading = ref(false);
const errorMessage = ref("");

// Fetch regional statistics

watch(
  dashboardFilter,
  async (filter, _, onCleanup) => {
    let cancelled = false;

    onCleanup(() => {
      cancelled = true;
    });

    loading.value = true;
    errorMessage.value = "";

    try {
      const result = await getDashboardDemographics(filter);

      if (cancelled) return;

      regions.value = result.regions ?? [];
    } catch (error) {
      if (cancelled) return;

      regions.value = [];

      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu khu vực.";
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
  <div class="flex min-w-0 flex-col gap-4">
    <!-- Loading state -->

    <div
      v-if="loading"
      class="rounded-xl border bg-card p-6 text-sm text-muted-foreground"
    >
      Đang tải dữ liệu khu vực...
    </div>

    <!-- Error state -->

    <div
      v-else-if="errorMessage"
      role="alert"
      class="rounded-xl border bg-card p-6 text-sm text-destructive"
    >
      {{ errorMessage }}
    </div>

    <!-- Regional statistics -->

    <template v-else>
      <RegionPieChart :regions="regions" />

      <RegionTable />
    </template>
  </div>
</template>
