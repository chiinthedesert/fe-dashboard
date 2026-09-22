<script setup lang="ts">
import { inject, ref, watch } from "vue";
import type { Ref } from "vue";

import ExamBoardChart from "@/components/dashboard/ExamBoardChart.vue";
import AgeGroupChart from "@/components/dashboard/AgeGroupChart.vue";

import { getDashboardDemographics } from "@/services/dashboard";

import type {
  DashboardFilter,
  DashboardEducationLevel,
} from "@/types/dashboard-api";

// Dashboard filter

const dashboardFilter = inject<Ref<DashboardFilter>>("dashboardFilter");

if (!dashboardFilter) {
  throw new Error("Dashboard filter is unavailable.");
}

// Demographics data

const educationLevels = ref<DashboardEducationLevel[]>([]);

// Request state

const loading = ref(false);
const errorMessage = ref("");

// Fetch demographics

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

      educationLevels.value = result.educationLevels ?? [];
    } catch (error) {
      if (cancelled) return;

      educationLevels.value = [];

      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu bảng thi.";
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
    <!-- Exam board chart -->

    <div
      v-if="loading"
      class="flex min-h-80 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground"
    >
      Đang tải dữ liệu bảng thi...
    </div>

    <div
      v-else-if="errorMessage"
      role="alert"
      class="flex min-h-80 items-center justify-center rounded-xl border bg-card p-4 text-sm text-destructive"
    >
      {{ errorMessage }}
    </div>

    <ExamBoardChart v-else :education-levels="educationLevels" />

    <!-- Age group demo chart -->

    <AgeGroupChart />
  </div>
</template>
