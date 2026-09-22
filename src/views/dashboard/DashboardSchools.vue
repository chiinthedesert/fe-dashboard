<script setup lang="ts">
import { onMounted, ref } from "vue";

import SchoolFollowUpTable from "@/components/dashboard/SchoolFollowUpTable.vue";

import { getCandidates, getCandidateSchools } from "@/services/candidates";

// School data

interface SchoolSummary {
  school: string;
  count: number;
  percentage: number;
}

const schools = ref<SchoolSummary[]>([]);
const totalCandidates = ref(0);

// Request state

const loading = ref(false);
const errorMessage = ref("");

// Fetch school statistics

async function loadSchools() {
  loading.value = true;
  errorMessage.value = "";

  try {
    // Get school names and total candidate count.

    const [schoolNames, candidatePage] = await Promise.all([
      getCandidateSchools(),
      getCandidates({
        page: 0,
        size: 1,
      }),
    ]);

    totalCandidates.value = candidatePage.totalElements;

    const names = [
      ...new Set(schoolNames.map((name) => name.trim()).filter(Boolean)),
    ];

    const results: SchoolSummary[] = [];

    // Fetch candidate counts in batches.

    const batchSize = 4;

    for (let i = 0; i < names.length; i += batchSize) {
      const batch = names.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (school) => {
          const result = await getCandidates({
            truongHoc: school,
            page: 0,
            size: 1,
          });

          const count = result.totalElements;

          return {
            school,
            count,
            percentage:
              totalCandidates.value > 0
                ? (count / totalCandidates.value) * 100
                : 0,
          };
        }),
      );

      results.push(...batchResults);
    }

    schools.value = results;
  } catch (error) {
    schools.value = [];
    totalCandidates.value = 0;

    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Không thể tải thống kê trường học.";
  } finally {
    loading.value = false;
  }
}

// Initial request

onMounted(loadSchools);
</script>

<template>
  <section class="min-w-0">
    <!-- Loading state -->

    <div
      v-if="loading"
      class="flex min-h-80 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground"
    >
      Đang tải thống kê trường học...
    </div>

    <!-- Error state -->

    <div
      v-else-if="errorMessage"
      role="alert"
      class="rounded-xl border bg-card p-6 text-sm text-destructive"
    >
      {{ errorMessage }}
    </div>

    <!-- School statistics -->

    <SchoolFollowUpTable
      v-else
      :schools="schools"
      :total-candidates="totalCandidates"
    />
  </section>
</template>
