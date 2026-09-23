<script setup lang="ts">
import { computed, watch } from "vue";

import {
  FlexRender,
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  filterFn_includesString,
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
  Search,
} from "lucide-vue-next";

import type { DashboardProvincePerformance } from "@/types/dashboard-api";

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

// Data and request state
const props = defineProps<{
  provinces: DashboardProvincePerformance[];
  loading: boolean;
  error: string;
}>();

type ProvinceRow = DashboardProvincePerformance;

const numberFormatter = new Intl.NumberFormat("vi-VN");
const percentFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
});

function isNumericColumn(id: string): boolean {
  return ["registrations", "confirmedParticipants", "conversionRate"].includes(id);
}

const regionOptions = computed(() =>
  [...new Set(props.provinces.map((item) => item.region).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "vi"),
  ),
);

// Table features and columns
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,

  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
    equalsString: filterFn_equalsString,
  },
  sortFns: {
    text: sortFn_text,
    basic: sortFn_basic,
  },
});

const columnHelper = createColumnHelper<typeof features, ProvinceRow>();

const columns = columnHelper.columns([
  columnHelper.accessor("province", {
    header: "Tỉnh / Thành",
    enableHiding: false,
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("region", {
    header: "Khu vực",
    filterFn: "equalsString",
    sortFn: "text",
  }),
  columnHelper.accessor("registrations", {
    header: "Đăng ký",
    sortFn: "basic",
  }),
  columnHelper.accessor("confirmedParticipants", {
    header: "Xác nhận tham gia",
    sortFn: "basic",
  }),
  columnHelper.accessor("conversionRate", {
    header: "Tỷ lệ chuyển đổi",
    sortFn: "basic",
  }),
]);

const table = useTable({
  features,
  data: computed(() => props.provinces),
  columns,
  initialState: {
    pagination: { pageIndex: 0, pageSize: 10 },
  },
});

// Search, filtering, pagination
const provinceSearch = computed({
  get: () => String(table.getColumn("province")?.getFilterValue() ?? ""),
  set: (value: string) => {
    table.getColumn("province")?.setFilterValue(value);
    table.setPageIndex(0);
  },
});

const selectedRegion = computed({
  get: () => String(table.getColumn("region")?.getFilterValue() ?? "all"),
  set: (value: string) => {
    table.getColumn("region")?.setFilterValue(value === "all" ? undefined : value);
    table.setPageIndex(0);
  },
});

function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}

// Keep the page within bounds when filters or the date range change.
watch(
  () => table.getFilteredRowModel().rows.length,
  (total) => {
    const { pageIndex, pageSize } = table.atoms.pagination.get();
    const lastPageIndex = Math.max(0, Math.ceil(total / pageSize) - 1);
    if (pageIndex > lastPageIndex) table.setPageIndex(lastPageIndex);
  },
);

watch(
  () => props.provinces,
  () => {
    table.setPageIndex(0);
    if (selectedRegion.value !== "all" && !regionOptions.value.includes(selectedRegion.value)) {
      selectedRegion.value = "all";
    }
  },
);
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <!-- Table header -->
    <CardHeader class="px-4">
      <CardTitle>Chi tiết theo tỉnh / thành</CardTitle>
      <CardDescription>
        Đăng ký, xác nhận tham gia và tỷ lệ chuyển đổi trong khoảng thời gian đã chọn
      </CardDescription>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <!-- Search, region filter and column visibility -->
      <div class="@container min-w-0">
        <div
          class="grid min-w-0 grid-cols-2 gap-3 @[36rem]:grid-cols-[minmax(12rem,20rem)_10rem_10rem] @[36rem]:justify-start"
        >
          <div class="relative col-span-2 min-w-0 @[36rem]:col-span-1">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="provinceSearch"
              placeholder="Tìm tỉnh / thành..."
              aria-label="Tìm tỉnh hoặc thành phố"
              class="w-full min-w-0 truncate pr-3 pl-9 text-sm"
            />
          </div>

          <Select v-model="selectedRegion">
            <SelectTrigger class="w-full min-w-0 gap-2" aria-label="Lọc theo khu vực">
              <SelectValue placeholder="Khu vực" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khu vực</SelectItem>
              <SelectItem v-for="region in regionOptions" :key="region" :value="region">
                {{ region }}
              </SelectItem>
            </SelectContent>
          </Select>

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
              align="end"
              :side-offset="4"
              class="w-max min-w-(--reka-dropdown-menu-trigger-width) max-w-[calc(100vw-1rem)]"
            >
              <DropdownMenuCheckboxItem
                v-for="column in table.getAllLeafColumns().filter((column) => column.getCanHide())"
                :key="column.id"
                :model-value="column.getIsVisible()"
                class="pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:size-4 [&_svg]:text-muted-foreground"
                @update:model-value="(value) => column.toggleVisibility(!!value)"
                @select.prevent
              >
                {{ column.columnDef.header }}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Responsive table -->
      <div class="min-w-0 max-w-full overflow-x-auto rounded-md border">
        <Table class="w-full">
          <TableHeader>
            <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                class="h-auto whitespace-normal px-3 py-2 text-left"
                :aria-sort="
                  header.column.getIsSorted() === 'asc'
                    ? 'ascending'
                    : header.column.getIsSorted() === 'desc'
                      ? 'descending'
                      : 'none'
                "
              >
                <div v-if="!header.isPlaceholder" class="flex min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="h-auto min-h-8 w-full min-w-0 gap-1 whitespace-normal"
                    :class="isNumericColumn(header.column.id) ? 'justify-center' : 'justify-start'"
                    @click="header.column.toggleSorting()"
                  >
                    <span class="min-w-0 whitespace-normal leading-tight">
                      <FlexRender
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                      />
                    </span>
                    <ArrowUp v-if="header.column.getIsSorted() === 'asc'" class="size-3.5 shrink-0" />
                    <ArrowDown
                      v-else-if="header.column.getIsSorted() === 'desc'"
                      class="size-3.5 shrink-0"
                    />
                    <ArrowUpDown v-else class="size-3.5 shrink-0 text-muted-foreground" />
                  </Button>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-if="loading">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-muted-foreground"
              >
                Đang tải dữ liệu tỉnh / thành...
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
              <TableRow v-for="row in table.getRowModel().rows" :key="row.original.province">
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-3 py-3 tabular-nums"
                  :class="isNumericColumn(cell.column.id) ? 'text-center' : 'text-left'"
                >
                  <span v-if="cell.column.id === 'province'" class="whitespace-normal font-medium">
                    {{ row.original.province || '—' }}
                  </span>
                  <Badge v-else-if="cell.column.id === 'region'" variant="secondary" class="whitespace-nowrap">
                    {{ row.original.region || '—' }}
                  </Badge>
                  <span v-else-if="cell.column.id === 'conversionRate'">
                    {{ percentFormatter.format(row.original.conversionRate) }}%
                  </span>
                  <span v-else>{{ numberFormatter.format(Number(cell.getValue() ?? 0)) }}</span>
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else>
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-muted-foreground"
              >
                Không tìm thấy kết quả.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <TablePagination
        :page="table.atoms.pagination.get().pageIndex + 1"
        :page-count="Math.max(1, table.getPageCount())"
        :page-size="table.atoms.pagination.get().pageSize"
        :total="table.getFilteredRowModel().rows.length"
        item-label="tỉnh"
        @update:page="table.setPageIndex($event - 1)"
        @update:page-size="changePageSize"
      />
    </CardContent>
  </Card>
</template>
