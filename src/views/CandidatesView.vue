<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";

import CandidatesTable from "@/components/candidates/CandidatesTable.vue";
import CandidateFormDialog from "@/components/candidates/CandidateFormDialog.vue";
import CandidateDetailDialog from "@/components/candidates/CandidateDetailDialog.vue";
import CandidateDeleteDialog from "@/components/candidates/CandidateDeleteDialog.vue";
import CandidateBulkDeleteDialog from "@/components/candidates/CandidateBulkDeleteDialog.vue";

import {
  getCandidate,
  getCandidates,
  getCandidatePartners,
  getCandidateProvinces,
  getCandidateSales,
  getCandidateSources,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  exportCandidates,
} from "@/services/candidates";

import type {
  CandidateFilter,
  CandidatePage,
  CandidateResponse,
  CreateCandidateRequest,
  StaffOptionResponse,
} from "@/types/candidate-api";

const candidates = ref<CandidateResponse[]>([]);

const keyword = ref("");
const searchKeyword = ref("");

const selectedStatus = ref("");
const selectedBoard = ref("");
const selectedProvince = ref("");
const selectedSource = ref("");
const selectedPartner = ref("");

const provinces = ref<string[]>([]);
const sources = ref<string[]>([]);
const partners = ref<string[]>([]);
const sales = ref<StaffOptionResponse[]>([]);
const filtersLoading = ref(false);
const filtersError = ref("");

const sortBy = ref("id");
const sortDir = ref<"asc" | "desc">("asc");

const page = ref(1);
const pageSize = ref(10);
const totalElements = ref(0);
const totalPages = ref(0);

const loading = ref(false);
const errorMessage = ref("");

const formOpen = ref(false);
const saving = ref(false);
const formError = ref("");
const editingCandidate = ref<CandidateResponse | null>(null);

const detailOpen = ref(false);
const detailLoading = ref(false);
const detailError = ref("");
const detailCandidate = ref<CandidateResponse | null>(null);

const deleteOpen = ref(false);
const deletingCandidate = ref<CandidateResponse | null>(null);
const deleting = ref(false);
const deleteError = ref("");

const bulkDeleteOpen = ref(false);
const selectedCandidateIds = ref<number[]>([]);
const bulkDeleting = ref(false);
const bulkDeleteError = ref("");

const exporting = ref(false);
const exportError = ref("");

const refreshKey = ref(0);

const boardFilterCache = ref<{ key: string; items: CandidateResponse[] } | null>(
  null,
);

const candidatesTableRef = ref<InstanceType<typeof CandidatesTable> | null>(
  null,
);

watch(keyword, (value, _, onCleanup) => {
  const timer = setTimeout(() => {
    page.value = 1;
    searchKeyword.value = value.trim();
  }, 300);

  onCleanup(() => clearTimeout(timer));
});

onMounted(async () => {
  filtersLoading.value = true;
  filtersError.value = "";

  const results = await Promise.allSettled([
    getCandidateProvinces(),
    getCandidateSources(),
    getCandidatePartners(),
    getCandidateSales(),
  ]);

  const [provinceResult, sourceResult, partnerResult, saleResult] = results;

  if (provinceResult.status === "fulfilled") {
    provinces.value = provinceResult.value;
  }

  if (sourceResult.status === "fulfilled") {
    sources.value = sourceResult.value;
  }

  if (partnerResult.status === "fulfilled") {
    partners.value = partnerResult.value;
  }

  if (saleResult.status === "fulfilled") {
    sales.value = saleResult.value;
  }

  if (results.some((result) => result.status === "rejected")) {
    filtersError.value =
      "Một số danh sách bộ lọc không tải được. Các chức năng còn lại vẫn có thể sử dụng.";
  }

  filtersLoading.value = false;
});

function currentApiFilter(): CandidateFilter {
  return {
    keyword: searchKeyword.value || undefined,
    tinhThanh: selectedProvince.value || undefined,
    trangThai: selectedStatus.value || undefined,
    nguonDangKy: selectedSource.value || undefined,
    doiTac: selectedPartner.value || undefined,
    sortBy: sortBy.value || undefined,
    sortDir: sortBy.value ? sortDir.value : undefined,
  };
}

function normalizedBoard(value: string | null | undefined): string {
  const normalized = value?.trim().toLocaleLowerCase("vi") ?? "";

  if (["bảng a", "table_a", "a"].includes(normalized)) return "a";
  if (["bảng b", "table_b", "b"].includes(normalized)) return "b";

  return normalized;
}

async function getCandidatesWithBoardFilter(): Promise<CandidatePage> {
  const batchSize = 500;
  const filter = currentApiFilter();
  const cacheKey = JSON.stringify({
    filter,
    board: selectedBoard.value,
    refreshKey: refreshKey.value,
  });

  let filtered: CandidateResponse[];

  if (boardFilterCache.value?.key === cacheKey) {
    filtered = boardFilterCache.value.items;
  } else {
    const firstPage = await getCandidates({
      ...filter,
      page: 0,
      size: batchSize,
    });

    let allCandidates = [...(firstPage.items ?? [])];

    if (firstPage.totalPages > 1) {
      const pageIndexes = Array.from(
        { length: firstPage.totalPages - 1 },
        (_, index) => index + 1,
      );

      const requestBatchSize = 4;

      for (let i = 0; i < pageIndexes.length; i += requestBatchSize) {
        const batch = pageIndexes.slice(i, i + requestBatchSize);

        const results = await Promise.all(
          batch.map((pageIndex) =>
            getCandidates({
              ...filter,
              page: pageIndex,
              size: batchSize,
            }),
          ),
        );

        for (const result of results) {
          allCandidates.push(...(result.items ?? []));
        }
      }
    }

    const board = normalizedBoard(selectedBoard.value);
    filtered = allCandidates.filter(
      (candidate) => normalizedBoard(candidate.bangDau) === board,
    );

    boardFilterCache.value = {
      key: cacheKey,
      items: filtered,
    };
  }

  const total = filtered.length;
  const pageCount = Math.ceil(total / pageSize.value);
  const start = (page.value - 1) * pageSize.value;
  const items = filtered.slice(start, start + pageSize.value);

  return {
    items,
    page: page.value - 1,
    size: pageSize.value,
    totalElements: total,
    totalPages: pageCount,
    hasNext: page.value < pageCount,
    hasPrevious: page.value > 1,
  };
}

watch(
  [
    page,
    pageSize,
    searchKeyword,
    selectedStatus,
    selectedBoard,
    selectedProvince,
    selectedSource,
    selectedPartner,
    sortBy,
    sortDir,
    refreshKey,
  ],
  async (_, __, onCleanup) => {
    let cancelled = false;

    onCleanup(() => {
      cancelled = true;
    });

    loading.value = true;
    errorMessage.value = "";

    try {
      const result = selectedBoard.value
        ? await getCandidatesWithBoardFilter()
        : await getCandidates({
            ...currentApiFilter(),
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
      if (!cancelled) loading.value = false;
    }
  },
  { immediate: true },
);

function changePageSize(size: number) {
  page.value = 1;
  pageSize.value = size;
}

function changeStatus(value: string) {
  page.value = 1;
  selectedStatus.value = value;
}

function changeBoard(value: string) {
  page.value = 1;
  selectedBoard.value = value;
}

function changeProvince(value: string) {
  page.value = 1;
  selectedProvince.value = value;
}

function changeSource(value: string) {
  page.value = 1;
  selectedSource.value = value;
}

function changePartner(value: string) {
  page.value = 1;
  selectedPartner.value = value;
}

function resetFilters() {
  page.value = 1;
  selectedStatus.value = "";
  selectedBoard.value = "";
  selectedProvince.value = "";
  selectedSource.value = "";
  selectedPartner.value = "";
}

function changeSort(field: string) {
  page.value = 1;

  if (sortBy.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDir.value = "asc";
  }
}

function openAddDialog() {
  if (saving.value) return;

  editingCandidate.value = null;
  formError.value = "";
  formOpen.value = true;
}

function openEditDialog(candidate: CandidateResponse) {
  if (saving.value) return;

  editingCandidate.value = { ...candidate };
  formError.value = "";
  formOpen.value = true;
}

async function openDetailDialog(candidate: CandidateResponse) {
  detailCandidate.value = candidate;
  detailError.value = "";
  detailOpen.value = true;
  detailLoading.value = true;

  try {
    detailCandidate.value = await getCandidate(candidate.id);
  } catch (error) {
    detailError.value =
      error instanceof Error
        ? error.message
        : "Không thể tải chi tiết thí sinh.";
  } finally {
    detailLoading.value = false;
  }
}

async function handleSaveCandidate(values: CreateCandidateRequest) {
  if (saving.value) return;

  saving.value = true;
  formError.value = "";

  const candidateToEdit = editingCandidate.value;

  try {
    if (candidateToEdit) {
      await updateCandidate(candidateToEdit.id, values);
    } else {
      await createCandidate(values);

      keyword.value = "";
      searchKeyword.value = "";
      resetFilters();
    }

    formOpen.value = false;
    editingCandidate.value = null;
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
  if (!deletingCandidate.value || deleting.value) return;

  deleting.value = true;
  deleteError.value = "";

  try {
    await deleteCandidate(deletingCandidate.value.id);

    deletingCandidate.value = null;
    deleteOpen.value = false;

    const remainingTotal = Math.max(0, totalElements.value - 1);
    const lastPage = Math.max(1, Math.ceil(remainingTotal / pageSize.value));

    if (page.value > lastPage) page.value = lastPage;
    else refreshKey.value++;
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
  if (exporting.value || selectedBoard.value) return;

  exporting.value = true;
  exportError.value = "";

  try {
    const file = await exportCandidates(currentApiFilter());

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "thi-sinh.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    exportError.value =
      error instanceof Error ? error.message : "Không thể xuất file Excel.";
  } finally {
    exporting.value = false;
  }
}

function openBulkDeleteDialog(ids: number[]) {
  if (bulkDeleting.value || ids.length === 0) return;

  selectedCandidateIds.value = [...ids];
  bulkDeleteError.value = "";
  bulkDeleteOpen.value = true;
}

async function handleBulkDeleteCandidates() {
  if (bulkDeleting.value || selectedCandidateIds.value.length === 0) return;

  bulkDeleting.value = true;
  bulkDeleteError.value = "";

  const ids = [...selectedCandidateIds.value];

  try {
    const results = await Promise.allSettled(
      ids.map((id) => deleteCandidate(id)),
    );

    const failedIds = ids.filter(
      (_, index) => results[index]?.status === "rejected",
    );

    const deletedCount = ids.length - failedIds.length;
    selectedCandidateIds.value = failedIds;

    if (deletedCount > 0) {
      const remainingTotal = Math.max(0, totalElements.value - deletedCount);
      const lastPage = Math.max(1, Math.ceil(remainingTotal / pageSize.value));

      if (page.value > lastPage) page.value = lastPage;
      else refreshKey.value++;
    }

    if (failedIds.length > 0) {
      bulkDeleteError.value =
        `Đã xóa ${deletedCount}/${ids.length} thí sinh. ` +
        `${failedIds.length} thí sinh không thể xóa.`;
      return;
    }

    bulkDeleteOpen.value = false;
    selectedCandidateIds.value = [];

    await nextTick();
    candidatesTableRef.value?.clearSelection();
  } finally {
    bulkDeleting.value = false;
  }
}
</script>

<template>
  <section class="min-w-0">
    <CandidatesTable
      ref="candidatesTableRef"
      :candidates="candidates"
      :keyword="keyword"
      :status="selectedStatus"
      :board="selectedBoard"
      :province="selectedProvince"
      :source="selectedSource"
      :partner="selectedPartner"
      :provinces="provinces"
      :sources="sources"
      :partners="partners"
      :filters-loading="filtersLoading"
      :filters-error="filtersError"
      :page="page"
      :page-size="pageSize"
      :total="totalElements"
      :total-pages="totalPages"
      :loading="loading"
      :error="errorMessage"
      :exporting="exporting"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      @update:keyword="keyword = $event"
      @update:status="changeStatus"
      @update:board="changeBoard"
      @update:province="changeProvince"
      @update:source="changeSource"
      @update:partner="changePartner"
      @update:page="page = $event"
      @update:page-size="changePageSize"
      @reset-filters="resetFilters"
      @add="openAddDialog"
      @view="openDetailDialog"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
      @export-file="handleExportCandidates"
      @delete-selected="openBulkDeleteDialog"
      @sort="changeSort"
    />

    <p v-if="exportError" role="alert" class="mt-3 text-sm text-destructive">
      {{ exportError }}
    </p>

    <CandidateFormDialog
      v-model:open="formOpen"
      :candidate="editingCandidate"
      :saving="saving"
      :error="formError"
      :provinces="provinces"
      :partners="partners"
      :sales="sales"
      @submit="handleSaveCandidate"
    />

    <CandidateDetailDialog
      v-model:open="detailOpen"
      :candidate="detailCandidate"
      :loading="detailLoading"
      :error="detailError"
    />

    <CandidateDeleteDialog
      v-model:open="deleteOpen"
      :candidate="deletingCandidate"
      :deleting="deleting"
      :error="deleteError"
      @confirm="handleDeleteCandidate"
    />

    <CandidateBulkDeleteDialog
      v-model:open="bulkDeleteOpen"
      :count="selectedCandidateIds.length"
      :deleting="bulkDeleting"
      :error="bulkDeleteError"
      @confirm="handleBulkDeleteCandidates"
    />
  </section>
</template>
