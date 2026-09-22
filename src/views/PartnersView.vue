<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import PartnersTable from "@/components/partners/PartnersTable.vue";
import PartnerFormDialog from "@/components/partners/PartnerFormDialog.vue";
import DeletePartnerDialog from "@/components/partners/DeletePartnerDialog.vue";

import {
  getPartners,
  getPartnerClassifications,
  createPartner,
  updatePartner,
  deletePartner,
} from "@/services/partners";

import type {
  PartnerResponse,
  PartnerPage,
  PartnerFormValues,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from "@/types/partner-api";

// Partner data

const partners = ref<PartnerResponse[]>([]);

// Search and filtering

const keyword = ref("");
const searchKeyword = ref("");

const selectedType = ref("");

const classifications = ref<string[]>([]);
const classificationsLoading = ref(false);
const classificationsError = ref("");

// Sorting

const sortBy = ref("");
const sortDir = ref<"asc" | "desc">("asc");

// Pagination

const page = ref(1);
const pageSize = ref(10);

const totalElements = ref(0);
const totalPages = ref(0);

// Request state

const loading = ref(false);
const errorMessage = ref("");

const refreshKey = ref(0);

// Form state

const formOpen = ref(false);
const saving = ref(false);
const formError = ref("");

const editingPartner = ref<PartnerResponse | null>(null);

// Delete state

const deleteOpen = ref(false);
const deleting = ref(false);
const deleteError = ref("");

const deletingPartner = ref<PartnerResponse | null>(null);

// Search debounce

watch(keyword, (value, _, onCleanup) => {
  const timer = setTimeout(() => {
    page.value = 1;
    searchKeyword.value = value.trim();
  }, 300);

  onCleanup(() => clearTimeout(timer));
});

// Fetch classifications

async function loadClassifications() {
  classificationsLoading.value = true;
  classificationsError.value = "";

  try {
    classifications.value = await getPartnerClassifications();
  } catch (error) {
    classificationsError.value =
      error instanceof Error
        ? error.message
        : "Không thể tải danh sách phân loại.";
  } finally {
    classificationsLoading.value = false;
  }
}

onMounted(loadClassifications);

// Fetch partners

watch(
  [page, pageSize, searchKeyword, selectedType, sortBy, sortDir, refreshKey],
  async (_, __, onCleanup) => {
    let cancelled = false;

    onCleanup(() => {
      cancelled = true;
    });

    loading.value = true;
    errorMessage.value = "";

    try {
      const result: PartnerPage = await getPartners({
        keyword: searchKeyword.value || undefined,
        phanLoai: selectedType.value || undefined,

        page: page.value - 1,
        size: pageSize.value,

        sortBy: sortBy.value || undefined,
        sortDir: sortBy.value ? sortDir.value : undefined,
      });

      if (cancelled) return;

      partners.value = result.items ?? [];

      totalElements.value = result.totalElements ?? 0;
      totalPages.value = result.totalPages ?? 0;
    } catch (error) {
      if (cancelled) return;

      partners.value = [];
      totalElements.value = 0;
      totalPages.value = 0;

      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách đối tác.";
    } finally {
      if (!cancelled) {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);

// Filter changes

function changeType(value: string) {
  page.value = 1;
  selectedType.value = value;
}

// Sorting

function changeSort(field: string) {
  page.value = 1;

  if (sortBy.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDir.value = "asc";
  }
}

// Pagination

function changePageSize(size: number) {
  page.value = 1;
  pageSize.value = size;
}

// Open creation dialog

function openAddDialog() {
  if (saving.value) return;

  editingPartner.value = null;

  formError.value = "";
  formOpen.value = true;
}

// Open editing dialog

function openEditDialog(partner: PartnerResponse) {
  if (saving.value) return;

  editingPartner.value = { ...partner };

  formError.value = "";
  formOpen.value = true;
}

// Save partner

async function handleSavePartner(values: PartnerFormValues) {
  if (saving.value) return;

  saving.value = true;
  formError.value = "";

  const wasEditing = editingPartner.value !== null;

  try {
    if (editingPartner.value) {
      // Update existing partner

      const request: UpdatePartnerRequest = {
        tenDoanhNghiep: values.tenDoanhNghiep,
        nguoiDaiDien: values.nguoiDaiDien,
        email: values.email,
        soDienThoai: values.soDienThoai,
        diaChi: values.diaChi,

        ...(values.nganhNghe && {
          nganhNghe: values.nganhNghe,
        }),
      };

      await updatePartner(editingPartner.value.id, request);
    } else {
      // Create new partner

      const request: CreatePartnerRequest = {
        tenDoanhNghiep: values.tenDoanhNghiep,
        maSoThue: values.maSoThue,

        ...(values.nguoiDaiDien && {
          nguoiDaiDien: values.nguoiDaiDien,
        }),

        ...(values.email && {
          email: values.email,
        }),

        ...(values.soDienThoai && {
          soDienThoai: values.soDienThoai,
        }),

        ...(values.diaChi && {
          diaChi: values.diaChi,
        }),

        ...(values.nganhNghe && {
          nganhNghe: values.nganhNghe,
        }),
      };

      await createPartner(request);
    }

    // Close form

    formOpen.value = false;
    editingPartner.value = null;

    // Reset filters after creation

    if (!wasEditing) {
      keyword.value = "";
      searchKeyword.value = "";
      selectedType.value = "";
      page.value = 1;
    }

    // Reload partner list

    refreshKey.value++;

    await loadClassifications();
  } catch (error) {
    formError.value =
      error instanceof Error
        ? error.message
        : "Không thể lưu thông tin đối tác.";
  } finally {
    saving.value = false;
  }
}

// Open deletion dialog

function openDeleteDialog(partner: PartnerResponse) {
  if (deleting.value) return;

  deletingPartner.value = partner;

  deleteError.value = "";
  deleteOpen.value = true;
}

// Delete partner

async function handleDeletePartner() {
  if (!deletingPartner.value || deleting.value) {
    return;
  }

  deleting.value = true;
  deleteError.value = "";

  try {
    await deletePartner(deletingPartner.value.id);

    // Close dialog

    deleteOpen.value = false;
    deletingPartner.value = null;

    // Keep pagination valid

    const remainingTotal = Math.max(0, totalElements.value - 1);

    const lastPage = Math.max(1, Math.ceil(remainingTotal / pageSize.value));

    if (page.value > lastPage) {
      page.value = lastPage;
    } else {
      refreshKey.value++;
    }
  } catch (error) {
    deleteError.value =
      error instanceof Error
        ? error.message
        : "Không thể xóa đối tác. Vui lòng thử lại.";
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <section class="min-w-0">
    <!-- Partners table -->

    <PartnersTable
      :partners="partners"
      :keyword="keyword"
      :type="selectedType"
      :classifications="classifications"
      :classifications-loading="classificationsLoading"
      :classifications-error="classificationsError"
      :page="page"
      :page-size="pageSize"
      :total="totalElements"
      :total-pages="totalPages"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :loading="loading"
      :error="errorMessage"
      @update:keyword="keyword = $event"
      @update:type="changeType"
      @update:page="page = $event"
      @update:page-size="changePageSize"
      @sort="changeSort"
      @add="openAddDialog"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
    />

    <!-- Create / Edit partner -->

    <PartnerFormDialog
      v-model:open="formOpen"
      :partner="editingPartner"
      :saving="saving"
      :error="formError"
      @submit="handleSavePartner"
    />

    <!-- Delete partner -->

    <DeletePartnerDialog
      v-model:open="deleteOpen"
      :partner="deletingPartner"
      :deleting="deleting"
      :error="deleteError"
      @confirm="handleDeletePartner"
    />
  </section>
</template>
