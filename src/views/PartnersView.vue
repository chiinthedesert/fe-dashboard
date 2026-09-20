<script setup lang="ts">
import { ref } from "vue";

import PartnersTable from "@/components/partners/PartnersTable.vue";
import PartnersFormDialog from "@/components/partners/PartnersFormDialog.vue";
import DeletePartnerDialog from "@/components/partners/DeletePartnerDialog.vue";

import { mockPartners } from "@/mocks/partners";
import type { Partner } from "@/types/partner";

const partners = ref<Partner[]>(structuredClone(mockPartners));

const isFormOpen = ref(false);
const selectedPartner = ref<Partner | null>(null);

const isDeleteOpen = ref(false);
const partnerToDelete = ref<Partner | null>(null);

function addPartner() {
  selectedPartner.value = null;
  isFormOpen.value = true;
}

function editPartner(partner: Partner) {
  selectedPartner.value = partner;
  isFormOpen.value = true;
}

function savePartner(values: Omit<Partner, "id">) {
  if (selectedPartner.value) {
    const id = selectedPartner.value.id;

    partners.value = partners.value.map((partner) =>
      partner.id === id ? { id, ...values } : partner,
    );
  } else {
    const nextId =
      Math.max(0, ...partners.value.map((partner) => partner.id)) + 1;

    partners.value.push({
      id: nextId,
      ...values,
    });
  }

  isFormOpen.value = false;
  selectedPartner.value = null;
}

function deletePartner(partner: Partner) {
  partnerToDelete.value = partner;
  isDeleteOpen.value = true;
}

function confirmDelete() {
  if (!partnerToDelete.value) return;

  partners.value = partners.value.filter(
    (partner) => partner.id !== partnerToDelete.value?.id,
  );

  isDeleteOpen.value = false;
  partnerToDelete.value = null;
}
</script>

<template>
  <div class="min-w-0">
    <PartnersTable
      :partners="partners"
      @add="addPartner"
      @edit="editPartner"
      @delete="deletePartner"
    />

    <PartnersFormDialog
      v-model:open="isFormOpen"
      :partner="selectedPartner"
      @submit="savePartner"
    />

    <DeletePartnerDialog
      v-model:open="isDeleteOpen"
      :partner="partnerToDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>
