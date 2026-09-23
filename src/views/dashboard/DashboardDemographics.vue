<script setup lang="ts">
import { inject, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";

import ExamBoardChart from "@/components/dashboard/ExamBoardChart.vue";
import AgeGroupChart from "@/components/dashboard/AgeGroupChart.vue";

import { getAgeGroups, getDashboardDemographics } from "@/services/dashboard";
import type {
  DashboardAgeGroups,
  DashboardEducationLevel,
  DashboardFilter,
} from "@/types/dashboard-api";

// Shared dashboard filter
const dashboardFilter = inject<Ref<DashboardFilter>>("dashboardFilter");
if (!dashboardFilter) {
  throw new Error("Dashboard filter is unavailable.");
}

// Exam board statistics
const educationLevels = ref<DashboardEducationLevel[]>([]);
const loading = ref(false);
const errorMessage = ref("");

watch(
  dashboardFilter,
  async (filter, _, onCleanup) => {
    let cancelled = false;
    onCleanup(() => { cancelled = true; });

    loading.value = true;
    errorMessage.value = "";
    try {
      const result = await getDashboardDemographics(filter);
      if (!cancelled) educationLevels.value = result.educationLevels ?? [];
    } catch (error) {
      if (!cancelled) {
        educationLevels.value = [];
        errorMessage.value = error instanceof Error ? error.message : "Không thể tải dữ liệu bảng thi.";
      }
    } finally {
      if (!cancelled) loading.value = false;
    }
  },
  { immediate: true },
);

// Age-group endpoint provides full-program data, without date filters.
const ageGroups = ref<DashboardAgeGroups | null>(null);
const ageLoading = ref(false);
const ageError = ref("");

onMounted(async () => {
  ageLoading.value = true;
  ageError.value = "";
  try {
    ageGroups.value = await getAgeGroups();
  } catch (error) {
    ageGroups.value = null;
    ageError.value = error instanceof Error ? error.message : "Không thể tải dữ liệu độ tuổi.";
  } finally {
    ageLoading.value = false;
  }
});
</script>

<template>
  <section class="grid min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-[3fr_2fr]">
    <!-- Exam board chart -->
    <div class="flex min-w-0 flex-col">
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
    </div>

    <!-- Age group chart -->
    <div class="flex min-w-0 flex-col">
      <AgeGroupChart :age-groups="ageGroups" :loading="ageLoading" :error="ageError" />
    </div>
  </section>
</template>
