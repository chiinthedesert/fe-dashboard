<script setup lang="ts">
import { ref } from "vue";

import PartnersTable from "@/components/partners/PartnersTable.vue";
import { mockPartners } from "@/mocks/partners";
import type { Partner } from "@/types/partner";

const partners = ref<Partner[]>(structuredClone(mockPartners));
</script>

<template>
  <PartnersTable :partners="partners" />
</template>
