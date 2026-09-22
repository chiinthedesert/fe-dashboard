<script setup lang="ts">
import { computed, ref, watch } from "vue";

import {
  FlexRender,
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/vue-table";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-vue-next";

import type { CandidateResponse } from "@/types/candidate-api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TablePagination from "@/components/shared/TablePagination.vue";

const props = defineProps<{
  candidates: CandidateResponse[];
  keyword: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading: boolean;
  error: string;
  exporting: boolean;
}>();

const emit = defineEmits<{
  "update:keyword": [value: string];
  "update:page": [value: number];
  "update:page-size": [value: number];

  add: [];
  view: [candidate: CandidateResponse];
  edit: [candidate: CandidateResponse];
  delete: [candidate: CandidateResponse];

  "import-file": [];
  "export-file": [];
}>();

// Table features
const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,

  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),

  sortFns: {
    text: sortFn_text,
    basic: sortFn_basic,
  },
});

const columnHelper = createColumnHelper<typeof features, CandidateResponse>();

const columns = columnHelper.columns([
  columnHelper.display({
    id: "selection",
    header: "",
    enableHiding: false,
    enableSorting: false,
  }),

  columnHelper.accessor("id", {
    header: "ID",
    sortFn: "basic",
  }),

  columnHelper.accessor("hoTen", {
    header: "Họ và tên",
    enableHiding: false,
    sortFn: "text",
  }),

  columnHelper.accessor("email", {
    header: "Email",
    sortFn: "text",
  }),

  columnHelper.accessor("soDienThoai", {
    header: "Số điện thoại",
    enableSorting: false,
  }),

  columnHelper.accessor("truongHoc", {
    header: "Trường học",
    sortFn: "text",
  }),

  columnHelper.accessor("trangThai", {
    header: "Trạng thái",
    sortFn: "text",
  }),

  columnHelper.display({
    id: "actions",
    header: "Thao tác",
    enableHiding: false,
    enableSorting: false,
  }),
]);

const table = useTable({
  features,

  data: computed(() => props.candidates),

  columns,

  // Data is already paginated by the backend.
  manualPagination: true,

  // Do not sort only the currently loaded page.
  manualSorting: true,

  // Temporarily disable sorting until API sorting is connected.
  enableSorting: false,

  initialState: {
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
});

// Multiple selection, stored by candidate ID
const selectedIds = ref<Set<number>>(new Set());

const selectedCount = computed(() => selectedIds.value.size);

const currentPageIds = computed(() =>
  table.getRowModel().rows.map((row) => row.original.id),
);

const pageSelection = computed<boolean | "indeterminate">(() => {
  const ids = currentPageIds.value;

  if (!ids.length) return false;

  const selectedOnPage = ids.filter((id) => selectedIds.value.has(id)).length;

  if (selectedOnPage === 0) return false;
  if (selectedOnPage === ids.length) return true;

  return "indeterminate";
});

function toggleCandidate(id: number, checked: boolean) {
  const next = new Set(selectedIds.value);

  if (checked) {
    next.add(id);
  } else {
    next.delete(id);
  }

  selectedIds.value = next;
}

function toggleCurrentPage(checked: boolean) {
  const next = new Set(selectedIds.value);

  for (const id of currentPageIds.value) {
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
  }

  selectedIds.value = next;
}

function clearSelection() {
  selectedIds.value = new Set();
}

// Remove deleted candidates from selection.
watch(
  () => props.candidates.map((candidate) => candidate.id),
  (ids) => {
    const existingIds = new Set(ids);

    selectedIds.value = new Set(
      [...selectedIds.value].filter((id) => existingIds.has(id)),
    );
  },
);

watch([() => props.page, () => props.keyword], () => {
  clearSelection();
});

function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}

// Use existing theme variants; custom status colors can come later.
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <CardHeader class="px-4">
      <CardTitle>Bảng dữ liệu thí sinh tập trung</CardTitle>

      <CardDescription>
        Quản lý toàn bộ hồ sơ thí sinh dự thi Python Master.
      </CardDescription>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <!-- Search, filter and actions -->
      <div class="@container min-w-0">
        <div
          class="grid min-w-0 grid-cols-2 gap-3 @[36rem]:grid-cols-3 @[64rem]:grid-cols-[minmax(12rem,1fr)_11rem_10rem_auto_auto_auto] @[64rem]:items-center"
        >
          <!-- Search -->
          <div class="relative min-w-0">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              :model-value="keyword"
              placeholder="Tìm ID, tên, SĐT, email, trường..."
              aria-label="Tìm kiếm thí sinh"
              class="w-full min-w-0 truncate pr-3 pl-9 text-sm"
              @update:model-value="emit('update:keyword', String($event ?? ''))"
            />
          </div>

          <!-- Status filter -->

          <!-- Column visibility -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                type="button"
                variant="outline"
                class="w-full min-w-0 justify-between gap-2 px-3 font-normal"
              >
                <span class="min-w-0 truncate text-left"> Hiển thị cột </span>

                <ChevronDown class="size-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              :side-offset="4"
              class="w-max min-w-(--reka-dropdown-menu-trigger-width) max-w-[calc(100vw-1rem)]"
            >
              <DropdownMenuCheckboxItem
                v-for="column in table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())"
                :key="column.id"
                :model-value="column.getIsVisible()"
                class="pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:size-4 [&_svg]:text-muted-foreground"
                @update:model-value="
                  (value) => column.toggleVisibility(!!value)
                "
                @select.prevent
              >
                {{ column.columnDef.header }}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Add candidate -->
          <Button
            type="button"
            class="w-full min-w-0 gap-2 @[64rem]:w-auto"
            @click="emit('add')"
          >
            <Plus class="size-4 shrink-0" />

            <span class="min-w-0 truncate"> Thêm thí sinh </span>
          </Button>

          <!-- Import: disabled until backend supports browser uploads -->
          <Button
            type="button"
            variant="outline"
            disabled
            class="w-full min-w-0 gap-2 @[64rem]:w-auto"
          >
            <Upload class="size-4 shrink-0" />

            <span class="min-w-0 truncate"> Nhập file </span>
          </Button>

          <!-- Export candidates -->
          <Button
            type="button"
            variant="outline"
            :disabled="exporting || loading"
            class="w-full min-w-0 gap-2 @[64rem]:w-auto"
            @click="emit('export-file')"
          >
            <Download class="size-4 shrink-0" />

            <span class="min-w-0 truncate">
              {{ exporting ? "Đang xuất..." : "Xuất file" }}
            </span>
          </Button>
        </div>
      </div>

      <!-- Selection summary -->
      <div
        v-if="selectedCount > 0"
        class="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2"
      >
        <p class="text-sm" role="status">
          Đã chọn
          <span class="font-medium">{{ selectedCount }}</span>
          thí sinh
        </p>

        <Button type="button" variant="ghost" size="sm" @click="clearSelection">
          Bỏ chọn
        </Button>
      </div>

      <!-- Responsive table -->
      <div class="min-w-0 max-w-full overflow-x-auto rounded-md border">
        <Table class="w-full">
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="h-auto px-3 py-2 text-left whitespace-normal"
                :class="{
                  'w-10': header.column.id === 'selection',
                  'text-center': header.column.id === 'actions',
                }"
                :aria-sort="
                  header.column.getCanSort()
                    ? header.column.getIsSorted() === 'asc'
                      ? 'ascending'
                      : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : 'none'
                    : undefined
                "
              >
                <template v-if="!header.isPlaceholder">
                  <!-- Select current page -->
                  <Checkbox
                    v-if="header.column.id === 'selection'"
                    :model-value="pageSelection"
                    :disabled="currentPageIds.length === 0"
                    aria-label="Chọn tất cả thí sinh trên trang này"
                    @update:model-value="
                      (value) => toggleCurrentPage(value === true)
                    "
                  />

                  <!-- Wrapping sortable header, like the region table -->
                  <div
                    v-else-if="header.column.getCanSort()"
                    class="flex min-w-0"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="h-auto min-h-8 w-full min-w-0 justify-start gap-1 px-1 whitespace-normal"
                      @click="header.column.toggleSorting()"
                    >
                      <span
                        class="min-w-0 text-left leading-tight whitespace-normal"
                      >
                        <FlexRender
                          :render="header.column.columnDef.header"
                          :props="header.getContext()"
                        />
                      </span>

                      <ArrowUp
                        v-if="header.column.getIsSorted() === 'asc'"
                        class="size-3.5 shrink-0"
                      />

                      <ArrowDown
                        v-else-if="header.column.getIsSorted() === 'desc'"
                        class="size-3.5 shrink-0"
                      />

                      <ArrowUpDown
                        v-else
                        class="size-3.5 shrink-0 text-muted-foreground"
                      />
                    </Button>
                  </div>

                  <!-- Non-sortable header -->
                  <FlexRender
                    v-else
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </template>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <!-- Loading state -->
            <TableRow v-if="loading">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-muted-foreground"
              >
                Đang tải danh sách thí sinh...
              </TableCell>
            </TableRow>

            <!-- Error state -->
            <TableRow v-else-if="error">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-destructive"
                role="alert"
              >
                {{ error }}
              </TableCell>
            </TableRow>

            <!-- Candidate rows -->
            <template v-else-if="table.getRowModel().rows.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.original.id"
                :data-state="
                  selectedIds.has(row.original.id) ? 'selected' : undefined
                "
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-3 py-3 whitespace-normal"
                >
                  <!-- Selection -->
                  <Checkbox
                    v-if="cell.column.id === 'selection'"
                    :model-value="selectedIds.has(row.original.id)"
                    :aria-label="`Chọn ${row.original.hoTen ?? 'thí sinh'}`"
                    @update:model-value="
                      (value) =>
                        toggleCandidate(row.original.id, value === true)
                    "
                  />

                  <!-- Candidate name -->
                  <span
                    v-else-if="cell.column.id === 'hoTen'"
                    class="font-medium"
                  >
                    {{ row.original.hoTen || "—" }}
                  </span>

                  <!-- School -->
                  <span v-else-if="cell.column.id === 'truongHoc'">
                    {{ row.original.truongHoc || "—" }}
                  </span>

                  <!-- Candidate status -->
                  <Badge
                    v-else-if="cell.column.id === 'trangThai'"
                    variant="outline"
                    class="whitespace-nowrap"
                  >
                    {{ row.original.trangThai || "—" }}
                  </Badge>

                  <!-- Actions -->
                  <div
                    v-else-if="cell.column.id === 'actions'"
                    class="flex items-center justify-center gap-1"
                  >
                    <!-- View candidate -->
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled
                      :aria-label="`Xem ${row.original.hoTen ?? 'thí sinh'}`"
                      @click="emit('view', row.original)"
                    >
                      <Eye class="size-4" />
                    </Button>

                    <!-- Edit candidate -->
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Chỉnh sửa ${row.original.hoTen ?? 'thí sinh'}`"
                      @click="emit('edit', row.original)"
                    >
                      <Pencil class="size-4" />
                    </Button>

                    <!-- Delete candidate -->
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="text-destructive hover:text-destructive"
                      :aria-label="`Xóa ${row.original.hoTen ?? 'thí sinh'}`"
                      @click="emit('delete', row.original)"
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>

                  <!-- Other columns -->
                  <span
                    v-else
                    class="text-muted-foreground"
                    :class="{
                      'tabular-nums':
                        cell.column.id === 'id' ||
                        cell.column.id === 'soDienThoai',
                    }"
                  >
                    {{ cell.getValue() ?? "—" }}
                  </span>
                </TableCell>
              </TableRow>
            </template>

            <!-- Empty state -->
            <TableRow v-else>
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-muted-foreground"
              >
                Không tìm thấy thí sinh.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <TablePagination
        :page="page"
        :page-count="Math.max(1, totalPages)"
        :page-size="pageSize"
        :total="total"
        item-label="thí sinh"
        @update:page="emit('update:page', $event)"
        @update:page-size="emit('update:page-size', $event)"
      />
    </CardContent>
  </Card>
</template>
