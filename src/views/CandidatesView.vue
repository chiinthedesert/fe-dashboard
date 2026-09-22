<script setup lang="ts">
import { ref, watch } from "vue";

import CandidatesTable from "@/components/candidates/CandidatesTable.vue";
import CandidateFormDialog from "@/components/candidates/CandidateFormDialog.vue";
import CandidateDeleteDialog from "@/components/candidates/CandidateDeleteDialog.vue";

import {
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  exportCandidates,
} from "@/services/candidates";

import type {
  CandidateResponse,
  CandidatePage,
  CreateCandidateRequest,
} from "@/types/candidate-api";

// Candidate data
const candidates = ref<CandidateResponse[]>([]);

// Search and pagination
const keyword = ref("");
const searchKeyword = ref("");

const page = ref(1);
const pageSize = ref(10);

const totalElements = ref(0);
const totalPages = ref(0);

// State
const loading = ref(false);
const errorMessage = ref("");
const formOpen = ref(false);
const saving = ref(false);
const formError = ref("");
const editingCandidate = ref<CandidateResponse | null>(null);
const deleteOpen = ref(false);
const deletingCandidate = ref<CandidateResponse | null>(null);
const deleting = ref(false);
const deleteError = ref("");
const exporting = ref(false);
const exportError = ref("");

// Trigger a new request after creating a candidate.
const refreshKey = ref(0);

// Debounce search requests.
watch(keyword, (value, _, onCleanup) => {
  const timer = setTimeout(() => {
    page.value = 1;
    searchKeyword.value = value.trim();
  }, 300);

  onCleanup(() => clearTimeout(timer));
});

// Fetch candidates whenever the query changes.
watch(
  [page, pageSize, searchKeyword, refreshKey],
  async (_, __, onCleanup) => {
    let cancelled = false;

    onCleanup(() => {
      cancelled = true;
    });

    loading.value = true;
    errorMessage.value = "";

    try {
      const result: CandidatePage = await getCandidates({
        keyword: searchKeyword.value || undefined,
        page: page.value - 1,
        size: pageSize.value,
      });

      if (cancelled) return;

      candidates.value = result.items ?? [];
      totalElements.value = result.totalElements ?? 0;
      totalPages.value = result.totalPages ?? 0;
    } catch (error) {
      if (cancelled) return;

      candidates.value = [];
      totalElements.value = 0;
      totalPages.value = 0;

      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách thí sinh.";
    } finally {
      if (!cancelled) {
        loading.value = false;
      }
    }
  },
  { immediate: true },
);

// Change page size.
function changePageSize(size: number) {
  page.value = 1;
  pageSize.value = size;
}

// Open candidate creation dialog.
function openAddDialog() {
  if (saving.value) return;

  editingCandidate.value = null;

  formError.value = "";
  formOpen.value = true;
}

// Open candidate editing dialog.
function openEditDialog(candidate: CandidateResponse) {
  if (saving.value) return;

  editingCandidate.value = { ...candidate };

  formError.value = "";
  formOpen.value = true;
}

async function handleSaveCandidate(values: CreateCandidateRequest) {
  if (saving.value) return;

  saving.value = true;
  formError.value = "";

  // Determine the operation before modifying editingCandidate.
  const candidateToEdit = editingCandidate.value;

  try {
    if (candidateToEdit) {
      // Update the existing candidate.
      await updateCandidate(candidateToEdit.id, values);
    } else {
      // Create a new candidate.
      await createCandidate(values);

      // Return to the first page after creation.
      keyword.value = "";
      searchKeyword.value = "";
      page.value = 1;
    }

    // Only close the dialog after a successful request.
    formOpen.value = false;
    editingCandidate.value = null;

    // Reload the candidate list from the backend.
    refreshKey.value++;
  } catch (error) {
    formError.value =
      error instanceof Error
        ? error.message
        : "Không thể lưu thông tin thí sinh.";
  } finally {
    saving.value = false;
  }
}

function openDeleteDialog(candidate: CandidateResponse) {
  deletingCandidate.value = candidate;
  deleteError.value = "";
  deleteOpen.value = true;
}

async function handleDeleteCandidate() {
  if (!deletingCandidate.value || deleting.value) {
    return;
  }

  deleting.value = true;
  deleteError.value = "";

  try {
    await deleteCandidate(deletingCandidate.value.id);

    deletingCandidate.value = null;
    deleteOpen.value = false;

    // If the current page becomes empty,
    // move back to the previous page.
    const remainingTotal = Math.max(0, totalElements.value - 1);

    const lastPage = Math.max(1, Math.ceil(remainingTotal / pageSize.value));

    if (page.value > lastPage) {
      page.value = lastPage;
    } else {
      refreshKey.value++;
    }

    // Reload the candidate list.
    refreshKey.value++;
  } catch (error) {
    deleteError.value =
      error instanceof Error
        ? error.message
        : "Không thể xóa thí sinh. Vui lòng thử lại.";
  } finally {
    deleting.value = false;
  }
}

async function handleExportCandidates() {
  if (exporting.value) return;

  exporting.value = true;
  exportError.value = "";

  try {
    const file = await exportCandidates({
      keyword: searchKeyword.value || undefined,
    });

    // Create a temporary URL for the downloaded file.
    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download = "thi-sinh.xlsx";

    document.body.appendChild(link);

    link.click();
    link.remove();

    // Release the temporary URL.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    exportError.value =
      error instanceof Error ? error.message : "Không thể xuất file Excel.";
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <section class="min-w-0">
    <CandidatesTable
      :candidates="candidates"
      :keyword="keyword"
      :page="page"
      :page-size="pageSize"
      :total="totalElements"
      :total-pages="totalPages"
      :loading="loading"
      :error="errorMessage"
      :exporting="exporting"
      @update:keyword="keyword = $event"
      @update:page="page = $event"
      @update:page-size="changePageSize"
      @add="openAddDialog"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
      @export-file="handleExportCandidates"
    />

    <p v-if="exportError" role="alert" class="mt-3 text-sm text-destructive">
      {{ exportError }}
    </p>

    <!-- Create / Edit candidate -->
    <CandidateFormDialog
      v-model:open="formOpen"
      :candidate="editingCandidate"
      :saving="saving"
      :error="formError"
      @submit="handleSaveCandidate"
    />

    <!-- Delete confirmation -->
    <CandidateDeleteDialog
      v-model:open="deleteOpen"
      :candidate="deletingCandidate"
      :deleting="deleting"
      :error="deleteError"
      @confirm="handleDeleteCandidate"
    />
  </section>
</template>
