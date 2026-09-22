<script setup lang="ts">
import { computed } from "vue";

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
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-vue-next";

import type { PartnerResponse } from "@/types/partner-api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  partners: PartnerResponse[];

  keyword: string;
  type: string;

  classifications: string[];
  classificationsLoading: boolean;
  classificationsError: string;

  page: number;
  pageSize: number;
  total: number;
  totalPages: number;

  sortBy: string;
  sortDir: "asc" | "desc";

  loading: boolean;
  error: string;
}>();

const emit = defineEmits<{
  "update:keyword": [value: string];
  "update:type": [value: string];

  "update:page": [value: number];
  "update:page-size": [value: number];

  sort: [field: string];

  add: [];
  edit: [partner: PartnerResponse];
  delete: [partner: PartnerResponse];
}>();

// Classification options

const classificationOptions = computed(() => [
  ...new Set(
    props.classifications
      .map((value) => value.trim())
      .filter((value) => value && value !== "all"),
  ),
]);

function changeType(value: string) {
  emit("update:type", value === "all" ? "" : value);
}

// Table features

const features = tableFeatures({
  columnVisibilityFeature,
});

// Table columns

const columnHelper = createColumnHelper<typeof features, PartnerResponse>();

const columns = columnHelper.columns([
  columnHelper.accessor("tenDoanhNghiep", {
    header: "Tên đơn vị",
    enableHiding: false,
  }),

  columnHelper.accessor("phanLoai", {
    header: "Phân loại",
  }),

  columnHelper.accessor("nguoiDaiDien", {
    header: "Người liên hệ",
  }),

  columnHelper.accessor("email", {
    header: "Email",
  }),

  columnHelper.accessor("soDienThoai", {
    header: "Số điện thoại",
  }),

  columnHelper.accessor("maSoThue", {
    header: "Mã số thuế",
  }),

  columnHelper.accessor("diaChi", {
    header: "Địa chỉ",
  }),

  columnHelper.accessor("nhanVienPhuTrach", {
    header: "Nhân viên phụ trách",
  }),

  columnHelper.accessor("createdAt", {
    header: "Ngày tạo",
  }),

  columnHelper.display({
    id: "actions",
    header: "Thao tác",
    enableHiding: false,
  }),
]);

// Table instance

const table = useTable({
  features,

  data: computed(() => props.partners),

  columns,

  initialState: {
    columnVisibility: {
      diaChi: false,
      nhanVienPhuTrach: false,
      createdAt: false,
    },
  },
});

// Sorting

const sortableColumns = new Set([
  "tenDoanhNghiep",
  "nguoiDaiDien",
  "email",
  "maSoThue",
  "createdAt",
]);

function isSortable(id: string): boolean {
  return sortableColumns.has(id);
}

// Formatters

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN");
}
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <!-- Card header -->

    <CardHeader class="px-4">
      <CardTitle> Danh sách đối tác và doanh nghiệp </CardTitle>

      <CardDescription>
        Quản lý đơn vị phối hợp, tài trợ và các đầu mối liên hệ của cuộc thi.
      </CardDescription>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <!-- Search, filter and actions -->

      <div class="@container min-w-0">
        <div
          class="grid min-w-0 grid-cols-2 gap-3 @[46rem]:grid-cols-[minmax(12rem,1fr)_10rem_10rem_auto] @[46rem]:items-center"
        >
          <!-- Search -->

          <div class="relative col-span-2 min-w-0 @[46rem]:col-span-1">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              :model-value="keyword"
              placeholder="Tìm tên, liên hệ, email..."
              aria-label="Tìm kiếm đối tác"
              class="w-full min-w-0 truncate pr-3 pl-9 text-sm"
              @update:model-value="
                (value) => emit('update:keyword', String(value ?? ''))
              "
            />
          </div>

          <!-- Classification filter -->

          <Select
            :model-value="type || 'all'"
            :disabled="classificationsLoading || !!classificationsError"
            @update:model-value="(value) => changeType(String(value ?? 'all'))"
          >
            <SelectTrigger
              class="w-full min-w-0 gap-2"
              aria-label="Lọc theo phân loại đối tác"
            >
              <SelectValue
                :placeholder="
                  classificationsLoading ? 'Đang tải...' : 'Phân loại'
                "
              />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all"> Tất cả loại </SelectItem>

              <SelectItem
                v-for="classification in classificationOptions"
                :key="classification"
                :value="classification"
              >
                {{ classification }}
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
                <span class="min-w-0 truncate"> Hiển thị cột </span>

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

          <!-- Add partner -->

          <Button
            type="button"
            class="w-full min-w-0 gap-2 @[46rem]:w-auto"
            @click="emit('add')"
          >
            <Plus class="size-4 shrink-0" />

            <span class="min-w-0 truncate"> Thêm đối tác </span>
          </Button>
        </div>
      </div>

      <!-- Classification error -->

      <p
        v-if="classificationsError"
        role="alert"
        class="text-sm text-destructive"
      >
        Không thể tải danh sách phân loại:
        {{ classificationsError }}
      </p>

      <!-- Responsive table -->

      <div class="min-w-0 max-w-full overflow-x-auto rounded-md border">
        <Table class="w-full">
          <!-- Table header -->

          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="h-auto whitespace-normal px-3 py-2"
                :class="{
                  'min-w-36': header.column.id === 'tenDoanhNghiep',
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
                  <!-- Sortable header -->

                  <Button
                    v-if="isSortable(header.column.id)"
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="h-auto min-h-8 w-full min-w-0 justify-start gap-1 px-1 whitespace-normal"
                    @click="emit('sort', header.column.id)"
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

          <!-- Table body -->

          <TableBody>
            <!-- Loading state -->

            <TableRow v-if="loading">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-muted-foreground"
              >
                Đang tải danh sách đối tác...
              </TableCell>
            </TableRow>

            <!-- API error -->

            <TableRow v-else-if="error">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-destructive"
              >
                {{ error }}
              </TableCell>
            </TableRow>

            <!-- Partner rows -->

            <template v-else-if="table.getRowModel().rows.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.original.id"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-3 py-3 whitespace-normal"
                >
                  <!-- Partner name -->

                  <span
                    v-if="cell.column.id === 'tenDoanhNghiep'"
                    class="font-medium wrap-break-word"
                  >
                    {{ row.original.tenDoanhNghiep || "—" }}
                  </span>

                  <!-- Classification -->

                  <Badge
                    v-else-if="
                      cell.column.id === 'phanLoai' && row.original.phanLoai
                    "
                    variant="secondary"
                    class="whitespace-nowrap"
                  >
                    {{ row.original.phanLoai }}
                  </Badge>

                  <!-- Created date -->

                  <span
                    v-else-if="cell.column.id === 'createdAt'"
                    class="whitespace-nowrap text-muted-foreground tabular-nums"
                  >
                    {{ formatDate(row.original.createdAt) }}
                  </span>

                  <!-- Actions -->

                  <div
                    v-else-if="cell.column.id === 'actions'"
                    class="flex items-center justify-center gap-1"
                  >
                    <!-- Edit partner -->

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Chỉnh sửa ${row.original.tenDoanhNghiep}`"
                      @click="emit('edit', row.original)"
                    >
                      <Pencil class="size-4" />
                    </Button>

                    <!-- Delete partner -->

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="text-destructive hover:text-destructive"
                      :aria-label="`Xóa ${row.original.tenDoanhNghiep}`"
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
                        cell.column.id === 'maSoThue' ||
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
                Không tìm thấy đối tác.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Server-side pagination -->

      <TablePagination
        :page="page"
        :page-count="Math.max(1, totalPages)"
        :page-size="pageSize"
        :total="total"
        item-label="đối tác"
        @update:page="emit('update:page', $event)"
        @update:page-size="emit('update:page-size', $event)"
      />
    </CardContent>
  </Card>
</template>
