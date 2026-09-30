<script setup lang="ts">
import { inject, ref, watch } from "vue";
import type { Ref } from "vue";

import TopPartnersTable from "@/components/dashboard/TopPartnersTable.vue";
import { getTopPartners } from "@/services/dashboard";

import type {
  DashboardFilter,
  DashboardTopPartnerItem,
} from "@/types/dashboard-api";

const dashboardFilter = inject<Ref<DashboardFilter>>("dashboardFilter");

if (!dashboardFilter) {
  throw new Error("Dashboard filter is unavailable.");
}

const partners = ref<DashboardTopPartnerItem[]>([]);
const totalCandidatesInTop = ref(0);
const loading = ref(false);
const errorMessage = ref("");

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
      const result = await getTopPartners(filter, 50);

      if (cancelled) return;

      partners.value = result.partners ?? [];
      totalCandidatesInTop.value = result.totalCandidatesInTop ?? 0;
    } catch (error) {
      if (cancelled) return;

      partners.value = [];
      totalCandidatesInTop.value = 0;
      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu trường / đối tác.";
    } finally {
      if (!cancelled) loading.value = false;
    }
  },
  { immediate: true },
);
</script>

<template>
  <section class="min-w-0">
    <TopPartnersTable
      :partners="partners"
      :total-candidates-in-top="totalCandidatesInTop"
      :loading="loading"
      :error="errorMessage"
    />
  </section>
</template>
