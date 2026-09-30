<script setup lang="ts">
import { computed, ref, watch } from "vue";

import {
  FlexRender,
  columnVisibilityFeature,
  createColumnHelper,
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
  SlidersHorizontal,
  Trash2,
} from "lucide-vue-next";

import type { CandidateResponse } from "@/types/candidate-api";
import { candidateDivisions } from "@/types/candidate";

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
  status: string;
  board: string;
  province: string;
  source: string;
  partner: string;

  provinces: string[];
  sources: string[];
  partners: string[];
  filtersLoading: boolean;
  filtersError: string;

  page: number;
  pageSize: number;
  total: number;
  totalPages: number;

  sortBy: string;
  sortDir: "asc" | "desc";

  loading: boolean;
  error: string;
  exporting: boolean;
}>();

const emit = defineEmits<{
  "update:keyword": [value: string];
  "update:status": [value: string];
  "update:board": [value: string];
  "update:province": [value: string];
  "update:source": [value: string];
  "update:partner": [value: string];

  "update:page": [value: number];
  "update:page-size": [value: number];

  sort: [field: string];
  "reset-filters": [];

  add: [];
  view: [candidate: CandidateResponse];
  edit: [candidate: CandidateResponse];
  delete: [candidate: CandidateResponse];
  "delete-selected": [ids: number[]];
  "export-file": [];
}>();

const filtersOpen = ref(false);

const activeFilterCount = computed(
  () =>
    [props.status, props.board, props.province, props.source, props.partner].filter(
      Boolean,
    ).length,
);

const normalizedProvinces = computed(() =>
  [...new Set(props.provinces.map((value) => value.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "vi"),
  ),
);

const normalizedSources = computed(() =>
  [...new Set(props.sources.map((value) => value.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "vi"),
  ),
);

const normalizedPartners = computed(() =>
  [...new Set(props.partners.map((value) => value.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "vi"),
  ),
);

const features = tableFeatures({
  columnVisibilityFeature,
});

const columnHelper = createColumnHelper<typeof features, CandidateResponse>();

const columns = columnHelper.columns([
  columnHelper.display({
    id: "selection",
    header: "",
    enableHiding: false,
  }),
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("hoTen", {
    header: "Họ và tên",
    enableHiding: false,
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("soDienThoai", {
    header: "Số điện thoại",
  }),
  columnHelper.accessor("truongHoc", {
    header: "Trường học",
  }),
  columnHelper.accessor("tinhThanh", {
    header: "Tỉnh / Thành phố",
  }),
  columnHelper.accessor("bangDau", {
    header: "Bảng đấu",
  }),
  columnHelper.accessor("trangThai", {
    header: "Trạng thái",
  }),
  columnHelper.accessor("ngayDangKy", {
    header: "Ngày đăng ký",
  }),
  columnHelper.accessor("nguonDangKy", {
    header: "Nguồn đăng ký",
  }),
  columnHelper.accessor("doiTac", {
    header: "Đối tác",
  }),
  columnHelper.accessor("assignedSaleName", {
    header: "Sale phụ trách",
  }),
  columnHelper.accessor("soTien", {
    header: "Số tiền",
  }),
  columnHelper.display({
    id: "actions",
    header: "Thao tác",
    enableHiding: false,
  }),
]);

const table = useTable({
  features,
  data: computed(() => props.candidates),
  columns,
  initialState: {
    columnVisibility: {
      nguonDangKy: false,
      doiTac: false,
      assignedSaleName: false,
      soTien: false,
    },
  },
});

const sortableColumns = new Set([
  "id",
  "hoTen",
  "email",
  "truongHoc",
  "ngayDangKy",
  "soTien",
]);

function isSortable(id: string): boolean {
  return sortableColumns.has(id);
}

function boardVariant(
  value: string | null | undefined,
): "default" | "secondary" | "outline" {
  const normalized = value?.trim().toLocaleLowerCase("vi") ?? "";

  if (["bảng a", "table_a", "a"].includes(normalized)) return "default";
  if (["bảng b", "table_b", "b"].includes(normalized)) return "secondary";
  return "outline";
}

function statusVariant(
  key: string | null | undefined,
): "default" | "secondary" | "outline" | "destructive" {
  if (key === "DA_DONG_PHI") return "default";
  if (key === "CHO_HO_SO") return "outline";
  if (key === "CHUA_DONG_PHI") return "destructive";
  return "secondary";
}

function sourceLabel(value: string | null | undefined): string {
  if (value === "DATA") return "Data";
  if (value === "GGFORM") return "Google Form";
  if (value === "FBADS") return "Facebook Ads";
  return value || "—";
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toLocaleString("vi-VN")} ₫`;
}

const selectedIds = ref<Set<number>>(new Set());
const selectedCount = computed(() => selectedIds.value.size);
const currentPageIds = computed(() =>
  table.getRowModel().rows.map((row) => row.original.id),
);

const pageSelection = computed<boolean | "indeterminate">(() => {
  const ids = currentPageIds.value;
  if (ids.length === 0) return false;

  const selectedOnPage = ids.filter((id) => selectedIds.value.has(id)).length;
  if (selectedOnPage === 0) return false;
  if (selectedOnPage === ids.length) return true;
  return "indeterminate";
});

function toggleCandidate(id: number, checked: boolean) {
  const next = new Set(selectedIds.value);
  if (checked) next.add(id);
  else next.delete(id);
  selectedIds.value = next;
}

function toggleCurrentPage(checked: boolean) {
  const next = new Set(selectedIds.value);

  for (const id of currentPageIds.value) {
    if (checked) next.add(id);
    else next.delete(id);
  }

  selectedIds.value = next;
}

function clearSelection() {
  selectedIds.value = new Set();
}

defineExpose({ clearSelection });

watch(
  [
    () => props.page,
    () => props.keyword,
    () => props.status,
    () => props.board,
    () => props.province,
    () => props.source,
    () => props.partner,
    () => props.sortBy,
    () => props.sortDir,
  ],
  clearSelection,
);

watch(
  () => props.candidates.map((candidate) => candidate.id),
  (ids) => {
    const existingIds = new Set(ids);
    selectedIds.value = new Set(
      [...selectedIds.value].filter((id) => existingIds.has(id)),
    );
  },
);
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
      <div class="@container min-w-0">
        <div
          class="grid min-w-0 grid-cols-2 gap-3 @[40rem]:grid-cols-3 @[64rem]:grid-cols-[minmax(14rem,1fr)_auto_10rem_auto_auto] @[64rem]:items-center"
        >
          <div class="relative col-span-2 min-w-0 @[64rem]:col-span-1">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              :model-value="keyword"
              placeholder="Tìm tên, SĐT, email, trường..."
              aria-label="Tìm kiếm thí sinh"
              class="w-full min-w-0 truncate pr-3 pl-9 text-sm"
              @update:model-value="emit('update:keyword', String($event ?? ''))"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            class="w-full min-w-0 justify-between gap-2 @[64rem]:w-auto"
            :aria-expanded="filtersOpen"
            aria-controls="candidate-filters"
            @click="filtersOpen = !filtersOpen"
          >
            <span class="flex min-w-0 items-center gap-2">
              <SlidersHorizontal class="size-4 shrink-0" />
              <span class="truncate">Bộ lọc</span>
              <Badge v-if="activeFilterCount" variant="secondary">
                {{ activeFilterCount }}
              </Badge>
            </span>
            <ChevronDown
              class="size-4 shrink-0 transition-transform"
              :class="{ 'rotate-180': filtersOpen }"
            />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                type="button"
                variant="outline"
                class="w-full min-w-0 justify-between gap-2 px-3 font-normal"
              >
                <span class="min-w-0 truncate text-left">Hiển thị cột</span>
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

          <Button
            type="button"
            class="w-full min-w-0 gap-2 @[64rem]:w-auto"
            @click="emit('add')"
          >
            <Plus class="size-4 shrink-0" />
            <span class="min-w-0 truncate">Thêm thí sinh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            :disabled="exporting || loading || !!board"
            :title="
              board
                ? 'Xuất Excel chưa hỗ trợ bộ lọc Bảng đấu vì API chưa có tham số này.'
                : undefined
            "
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

      <div
        id="candidate-filters"
        v-show="filtersOpen"
        class="grid min-w-0 grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Select
          :model-value="status || 'all'"
          @update:model-value="
            (value) =>
              emit(
                'update:status',
                value === 'all' ? '' : String(value ?? ''),
              )
          "
        >
          <SelectTrigger class="w-full min-w-0" aria-label="Lọc theo trạng thái">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="DA_DONG_PHI">Đã đóng phí</SelectItem>
            <SelectItem value="CHO_HO_SO">Chờ hồ sơ</SelectItem>
            <SelectItem value="CHUA_DONG_PHI">Chưa đóng phí</SelectItem>
          </SelectContent>
        </Select>

        <Select
          :model-value="board || 'all'"
          @update:model-value="
            (value) =>
              emit('update:board', value === 'all' ? '' : String(value ?? ''))
          "
        >
          <SelectTrigger class="w-full min-w-0" aria-label="Lọc theo bảng đấu">
            <SelectValue placeholder="Bảng đấu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bảng đấu</SelectItem>
            <SelectItem
              v-for="division in candidateDivisions"
              :key="division"
              :value="division"
            >
              {{ division }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          :model-value="province || 'all'"
          :disabled="filtersLoading"
          @update:model-value="
            (value) =>
              emit(
                'update:province',
                value === 'all' ? '' : String(value ?? ''),
              )
          "
        >
          <SelectTrigger class="w-full min-w-0" aria-label="Lọc theo tỉnh thành">
            <SelectValue placeholder="Tỉnh / Thành phố" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tỉnh / thành</SelectItem>
            <SelectItem
              v-for="item in normalizedProvinces"
              :key="item"
              :value="item"
            >
              {{ item }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          :model-value="source || 'all'"
          :disabled="filtersLoading"
          @update:model-value="
            (value) =>
              emit('update:source', value === 'all' ? '' : String(value ?? ''))
          "
        >
          <SelectTrigger class="w-full min-w-0" aria-label="Lọc theo nguồn đăng ký">
            <SelectValue placeholder="Nguồn đăng ký" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nguồn</SelectItem>
            <SelectItem
              v-for="item in normalizedSources"
              :key="item"
              :value="item"
            >
              {{ sourceLabel(item) }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          :model-value="partner || 'all'"
          :disabled="filtersLoading"
          @update:model-value="
            (value) =>
              emit(
                'update:partner',
                value === 'all' ? '' : String(value ?? ''),
              )
          "
        >
          <SelectTrigger class="w-full min-w-0" aria-label="Lọc theo đối tác">
            <SelectValue placeholder="Đối tác" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đối tác</SelectItem>
            <SelectItem
              v-for="item in normalizedPartners"
              :key="item"
              :value="item"
            >
              {{ item }}
            </SelectItem>
          </SelectContent>
        </Select>

        <div class="flex items-center sm:col-span-2 lg:col-span-5">
          <Button
            v-if="activeFilterCount"
            type="button"
            variant="ghost"
            size="sm"
            @click="emit('reset-filters')"
          >
            Xóa bộ lọc
          </Button>

          <p
            v-if="board"
            class="ml-auto text-xs text-muted-foreground"
          >
            Bảng đấu được lọc ở frontend vì API chưa có tham số tương ứng; bỏ lọc này để xuất Excel.
          </p>
        </div>
      </div>

      <p v-if="filtersError" role="alert" class="text-sm text-destructive">
        {{ filtersError }}
      </p>

      <div
        v-if="selectedCount > 0"
        class="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2"
      >
        <p class="text-sm" role="status">
          Đã chọn
          <span class="font-medium">{{ selectedCount }}</span>
          thí sinh
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" @click="clearSelection">
            Bỏ chọn
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            class="gap-2"
            @click="emit('delete-selected', [...selectedIds])"
          >
            <Trash2 class="size-4" />
            Xóa đã chọn
          </Button>
        </div>
      </div>

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
                  isSortable(header.column.id)
                    ? sortBy === header.column.id
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    : undefined
                "
              >
                <template v-if="!header.isPlaceholder">
                  <Checkbox
                    v-if="header.column.id === 'selection'"
                    :model-value="pageSelection"
                    :disabled="currentPageIds.length === 0 || loading"
                    aria-label="Chọn tất cả thí sinh trên trang này"
                    @update:model-value="
                      (value) => toggleCurrentPage(value === true)
                    "
                  />

                  <div
                    v-else-if="isSortable(header.column.id)"
                    class="flex min-w-0"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="h-auto min-h-8 w-full min-w-0 justify-start gap-1 px-1 whitespace-normal"
                      @click="emit('sort', header.column.id)"
                    >
                      <span class="min-w-0 text-left leading-tight whitespace-normal">
                        <FlexRender
                          :render="header.column.columnDef.header"
                          :props="header.getContext()"
                        />
                      </span>

                      <ArrowUp
                        v-if="sortBy === header.column.id && sortDir === 'asc'"
                        class="size-3.5 shrink-0"
                      />
                      <ArrowDown
                        v-else-if="
                          sortBy === header.column.id && sortDir === 'desc'
                        "
                        class="size-3.5 shrink-0"
                      />
                      <ArrowUpDown
                        v-else
                        class="size-3.5 shrink-0 text-muted-foreground"
                      />
                    </Button>
                  </div>

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
            <TableRow v-if="loading">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-muted-foreground"
              >
                Đang tải danh sách thí sinh...
              </TableCell>
            </TableRow>

            <TableRow v-else-if="error">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-destructive"
                role="alert"
              >
                {{ error }}
              </TableCell>
            </TableRow>

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
                  <Checkbox
                    v-if="cell.column.id === 'selection'"
                    :model-value="selectedIds.has(row.original.id)"
                    :aria-label="`Chọn ${row.original.hoTen ?? 'thí sinh'}`"
                    @update:model-value="
                      (value) =>
                        toggleCandidate(row.original.id, value === true)
                    "
                  />

                  <span
                    v-else-if="cell.column.id === 'hoTen'"
                    class="font-medium"
                  >
                    {{ row.original.hoTen || "—" }}
                  </span>

                  <Badge
                    v-else-if="cell.column.id === 'bangDau'"
                    :variant="boardVariant(row.original.bangDau)"
                  >
                    {{ row.original.bangDau || "—" }}
                  </Badge>

                  <Badge
                    v-else-if="cell.column.id === 'trangThai'"
                    :variant="statusVariant(row.original.trangThaiKey)"
                  >
                    {{ row.original.trangThai || "—" }}
                  </Badge>

                  <span
                    v-else-if="cell.column.id === 'nguonDangKy'"
                    class="text-muted-foreground"
                  >
                    {{ sourceLabel(row.original.nguonDangKy) }}
                  </span>

                  <span
                    v-else-if="cell.column.id === 'ngayDangKy'"
                    class="whitespace-nowrap text-muted-foreground tabular-nums"
                  >
                    {{ formatDateTime(row.original.ngayDangKy) }}
                  </span>

                  <span
                    v-else-if="cell.column.id === 'soTien'"
                    class="whitespace-nowrap text-muted-foreground tabular-nums"
                  >
                    {{ formatMoney(row.original.soTien) }}
                  </span>

                  <div
                    v-else-if="cell.column.id === 'actions'"
                    class="flex items-center justify-center gap-1"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Xem ${row.original.hoTen ?? 'thí sinh'}`"
                      @click="emit('view', row.original)"
                    >
                      <Eye class="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Chỉnh sửa ${row.original.hoTen ?? 'thí sinh'}`"
                      @click="emit('edit', row.original)"
                    >
                      <Pencil class="size-4" />
                    </Button>
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
