<script setup lang="ts">
import { ref } from "vue";

import CandidatesTable from "@/components/candidates/CandidatesTable.vue";

import { mockCandidates } from "@/mocks/candidates";
import type { Candidate } from "@/types/candidate";

const candidates = ref<Candidate[]>(
  mockCandidates.map((candidate) => ({ ...candidate })),
);
</script>

<template>
  <section class="min-w-0">
    <CandidatesTable :candidates="candidates" />
  </section>
</template>
