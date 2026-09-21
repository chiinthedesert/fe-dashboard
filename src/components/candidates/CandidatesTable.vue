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

import {
  candidateStatuses,
  type Candidate,
  type CandidateStatus,
} from "@/types/candidate";

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

// Props and events
const props = defineProps<{
  candidates: Candidate[];
}>();

const emit = defineEmits<{
  add: [];
  view: [candidate: Candidate];
  edit: [candidate: Candidate];
  delete: [candidate: Candidate];
  "import-file": [];
  "export-file": [];
}>();

// Search and status filter
const candidateSearch = ref("");
const selectedStatus = ref("all");

const filteredCandidates = computed(() => {
  const search = candidateSearch.value.trim().toLocaleLowerCase("vi-VN");

  return props.candidates.filter((candidate) => {
    const matchesStatus =
      selectedStatus.value === "all" ||
      candidate.status === selectedStatus.value;

    const matchesSearch =
      !search ||
      [
        String(candidate.id),
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.school,
      ].some((value) => value.toLocaleLowerCase("vi-VN").includes(search));

    return matchesStatus && matchesSearch;
  });
});

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

const columnHelper = createColumnHelper<typeof features, Candidate>();

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

  columnHelper.accessor("name", {
    header: "Họ và tên",
    enableHiding: false,
    sortFn: "text",
  }),

  columnHelper.accessor("email", {
    header: "Email",
    sortFn: "text",
  }),

  columnHelper.accessor("phone", {
    header: "Số điện thoại",
    enableSorting: false,
  }),

  columnHelper.accessor("school", {
    header: "Trường học",
    sortFn: "text",
  }),

  columnHelper.accessor("status", {
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
  data: filteredCandidates,
  columns,

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

// New search/filter starts on page 1 with no selection.
watch([candidateSearch, selectedStatus], () => {
  table.setPageIndex(0);
  clearSelection();
});

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

// Keep pagination valid when rows are removed.
watch(
  () => filteredCandidates.value.length,
  (total) => {
    const { pageIndex, pageSize } = table.atoms.pagination.get();
    const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);

    if (pageIndex > lastPage) {
      table.setPageIndex(lastPage);
    }
  },
);

function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}

// Use existing theme variants; custom status colors can come later.
function statusStyle(status: CandidateStatus) {
  switch (status) {
    case "Đã đóng phí":
      return { variant: "default" as const };

    case "Đã nộp bài":
      return {
        variant: "secondary" as const,
        class:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      };

    case "Đang xét duyệt":
      return { variant: "secondary" as const };

    case "Bị loại":
      return { variant: "destructive" as const };

    default:
      return { variant: "outline" as const };
  }
}
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
              v-model="candidateSearch"
              placeholder="Tìm ID, tên, SĐT, email, trường..."
              aria-label="Tìm kiếm thí sinh"
              class="w-full min-w-0 truncate pr-3 pl-9 text-sm"
            />
          </div>

          <!-- Status filter -->
          <Select v-model="selectedStatus">
            <SelectTrigger
              class="w-full min-w-0 gap-2"
              aria-label="Lọc theo trạng thái"
            >
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all"> Tất cả trạng thái </SelectItem>

              <SelectItem
                v-for="status in candidateStatuses"
                :key="status"
                :value="status"
              >
                {{ status }}
              </SelectItem>
            </SelectContent>
          </Select>

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

          <!-- Import: event only -->
          <Button
            type="button"
            variant="outline"
            class="w-full min-w-0 gap-2 @[64rem]:w-auto"
            @click="emit('import-file')"
          >
            <Upload class="size-4 shrink-0" />

            <span class="min-w-0 truncate"> Nhập file </span>
          </Button>

          <!-- Export: event only -->
          <Button
            type="button"
            variant="outline"
            class="w-full min-w-0 gap-2 @[64rem]:w-auto"
            @click="emit('export-file')"
          >
            <Download class="size-4 shrink-0" />

            <span class="min-w-0 truncate"> Xuất file </span>
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
            <template v-if="table.getRowModel().rows.length">
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
                    :aria-label="`Chọn ${row.original.name}`"
                    @update:model-value="
                      (value) =>
                        toggleCandidate(row.original.id, value === true)
                    "
                  />

                  <!-- Name wraps naturally -->
                  <span
                    v-else-if="cell.column.id === 'name'"
                    class="font-medium"
                  >
                    {{ row.original.name }}
                  </span>

                  <!-- School wraps without a forced minimum width -->
                  <span v-else-if="cell.column.id === 'school'">
                    {{ row.original.school }}
                  </span>

                  <!-- Keep badges intact, like the reference tables -->
                  <Badge
                    v-else-if="cell.column.id === 'status'"
                    v-bind="statusStyle(row.original.status)"
                    class="whitespace-nowrap"
                  >
                    {{ row.original.status }}
                  </Badge>

                  <!-- Actions -->
                  <div
                    v-else-if="cell.column.id === 'actions'"
                    class="flex items-center justify-center gap-1"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Xem ${row.original.name}`"
                      @click="emit('view', row.original)"
                    >
                      <Eye class="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Chỉnh sửa ${row.original.name}`"
                      @click="emit('edit', row.original)"
                    >
                      <Pencil class="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="text-destructive hover:text-destructive"
                      :aria-label="`Xóa ${row.original.name}`"
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
                        cell.column.id === 'id' || cell.column.id === 'phone',
                    }"
                  >
                    {{ cell.getValue() }}
                  </span>
                </TableCell>
              </TableRow>
            </template>

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
        :page="table.atoms.pagination.get().pageIndex + 1"
        :page-count="Math.max(1, table.getPageCount())"
        :page-size="table.atoms.pagination.get().pageSize"
        :total="filteredCandidates.length"
        item-label="thí sinh"
        @update:page="table.setPageIndex($event - 1)"
        @update:page-size="changePageSize"
      />
    </CardContent>
  </Card>
</template>
