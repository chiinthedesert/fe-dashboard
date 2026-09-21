<script setup lang="ts">
import { ref } from "vue";

import PartnersTable from "@/components/partners/PartnersTable.vue";
import PartnerFormDialog from "@/components/partners/PartnerFormDialog.vue";
import DeletePartnerDialog from "@/components/partners/DeletePartnerDialog.vue";

import { mockPartners } from "@/mocks/partners";
import type { Partner } from "@/types/partner";

// Partner data
const partners = ref<Partner[]>(structuredClone(mockPartners));

// Form dialog state
const isFormOpen = ref(false);
const selectedPartner = ref<Partner | null>(null);

// Delete dialog state
const isDeleteOpen = ref(false);
const partnerToDelete = ref<Partner | null>(null);

// Open the form to add a partner
function addPartner() {
  selectedPartner.value = null;
  isFormOpen.value = true;
}

// Open the form to edit a partner
function editPartner(partner: Partner) {
  selectedPartner.value = partner;
  isFormOpen.value = true;
}

// Save partner information
function savePartner(values: Omit<Partner, "id">) {
  if (selectedPartner.value) {
    // Update existing partner
    const id = selectedPartner.value.id;

    partners.value = partners.value.map((partner) =>
      partner.id === id ? { id, ...values } : partner,
    );
  } else {
    // Add new partner
    const nextId =
      Math.max(0, ...partners.value.map((partner) => partner.id)) + 1;

    partners.value.push({
      id: nextId,
      ...values,
    });
  }

  // Close the form dialog
  isFormOpen.value = false;
  selectedPartner.value = null;
}

// Open the delete confirmation dialog
function deletePartner(partner: Partner) {
  partnerToDelete.value = partner;
  isDeleteOpen.value = true;
}

// Confirm deletion
function confirmDelete() {
  if (!partnerToDelete.value) return;

  partners.value = partners.value.filter(
    (partner) => partner.id !== partnerToDelete.value?.id,
  );

  // Close the delete dialog
  isDeleteOpen.value = false;
  partnerToDelete.value = null;
}
</script>

<template>
  <div class="min-w-0">
    <!-- Partners table -->
    <PartnersTable
      :partners="partners"
      @add="addPartner"
      @edit="editPartner"
      @delete="deletePartner"
    />

    <!-- Add / Edit partner dialog -->
    <PartnerFormDialog
      v-model:open="isFormOpen"
      :partner="selectedPartner"
      @submit="savePartner"
    />

    <!-- Delete partner dialog -->
    <DeletePartnerDialog
      v-model:open="isDeleteOpen"
      :partner="partnerToDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
