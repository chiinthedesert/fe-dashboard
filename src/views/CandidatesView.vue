<script setup lang="ts">
import { ref } from "vue";

import CandidatesTable from "@/components/candidates/CandidatesTable.vue";
import CandidateFormDialog from "@/components/candidates/CandidateFormDialog.vue";

import { mockCandidates } from "@/mocks/candidates";
import { mockSalesPeople } from "@/mocks/salesPeople";

import type { Candidate, CandidateFormValues } from "@/types/candidate";

const candidates = ref<Candidate[]>(
  mockCandidates.map((candidate) => ({ ...candidate })),
);

const formOpen = ref(false);
const editingCandidate = ref<Candidate | null>(null);

// Increment independently so deleted IDs are not reused during this session.
let nextId =
  Math.max(1000, ...candidates.value.map((candidate) => candidate.id)) + 1;

function openAddDialog() {
  editingCandidate.value = null;
  formOpen.value = true;
}

function openEditDialog(candidate: Candidate) {
  editingCandidate.value = candidate;
  formOpen.value = true;
}

function saveCandidate(values: CandidateFormValues) {
  if (editingCandidate.value) {
    const id = editingCandidate.value.id;

    candidates.value = candidates.value.map((candidate) =>
      candidate.id === id ? { ...candidate, ...values } : candidate,
    );
  } else {
    candidates.value = [{ id: nextId++, ...values }, ...candidates.value];
  }

  formOpen.value = false;
  editingCandidate.value = null;
}
</script>

<template>
  <section class="min-w-0">
    <CandidatesTable
      :candidates="candidates"
      @add="openAddDialog"
      @edit="openEditDialog"
    />

    <CandidateFormDialog
      v-model:open="formOpen"
      :candidate="editingCandidate"
      :sales-people="mockSalesPeople"
      @submit="saveCandidate"
    />
  </section>
</template>
