<script setup lang="ts">
import { computed } from "vue";

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
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Download,
  Search,
} from "lucide-vue-next";

import { schoolFollowUpData } from "@/mocks/dashboardCharts";

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

type SchoolRow = (typeof schoolFollowUpData)[number];

const numberFormatter = new Intl.NumberFormat("vi-VN");

function isNumericColumn(id: string) {
  return ["shortfall", "conversion", "overdueDays"].includes(id);
}

// Table configuration

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

const columnHelper = createColumnHelper<typeof features, SchoolRow>();

const columns = columnHelper.columns([
  columnHelper.accessor("school", {
    header: "Trường",
    enableHiding: false,
    filterFn: "includesString",
    sortFn: "text",
  }),

  columnHelper.accessor("region", {
    header: "Khu vực",
    filterFn: "equalsString",
    sortFn: "text",
  }),

  columnHelper.accessor("shortfall", {
    header: "Thiếu mục tiêu tuần",
    sortFn: "basic",
  }),

  columnHelper.accessor("conversion", {
    header: "Tỷ lệ chuyển đổi",
    sortFn: "basic",
  }),

  columnHelper.accessor((row) => row.overdueDays ?? undefined, {
    id: "overdueDays",
    header: "Quá hạn (ngày)",
    sortFn: "basic",
    sortUndefined: "last",
  }),
]);

const table = useTable({
  features,
  data: schoolFollowUpData,
  columns,

  initialState: {
    sorting: [
      {
        id: "shortfall",
        desc: true,
      },
    ],

    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
});

// Search by school name

const schoolSearch = computed({
  get: () => String(table.getColumn("school")?.getFilterValue() ?? ""),

  set: (value: string) => {
    table.getColumn("school")?.setFilterValue(value);
    table.setPageIndex(0);
  },
});

// Region filter

const selectedRegion = computed({
  get: () => String(table.getColumn("region")?.getFilterValue() ?? "all"),

  set: (value: string) => {
    table
      .getColumn("region")
      ?.setFilterValue(value === "all" ? undefined : value);

    table.setPageIndex(0);
  },
});

// Pagination

function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}

// CSV export

function escapeCSV(value: string | number | null): string {
  const text = String(value ?? "");

  // Prevent spreadsheet applications from interpreting
  // user-provided values as formulas.
  const safe = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text;

  return `"${safe.replace(/"/g, '""')}"`;
}

function exportCSV() {
  const headers = [
    "Trường",
    "Khu vực",
    "Thiếu mục tiêu tuần",
    "Tỷ lệ chuyển đổi (%)",
    "Quá hạn (ngày)",
  ];

  // Export all filtered and sorted rows,
  // not just the current page.
  const rows = table.getSortedRowModel().rows.map((row) => {
    const school = row.original;

    return [
      school.school,
      school.region,
      school.shortfall,
      school.conversion,
      school.overdueDays,
    ];
  });

  const csv = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  // UTF-8 BOM for Vietnamese text in Excel.
  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "bao-cao-truong-hoc.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <!-- Header -->
    <CardHeader class="px-4">
      <CardTitle>Trường học cần thúc đẩy</CardTitle>

      <CardDescription>
        Xếp hạng theo số lượng còn thiếu so với mục tiêu đăng ký trong tuần
      </CardDescription>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <!-- Search, filter and actions -->
      <div class="@container min-w-0">
        <div
          class="grid min-w-0 grid-cols-2 gap-3 @[46rem]:grid-cols-[minmax(12rem,20rem)_10rem_10rem_minmax(0,1fr)_auto] @[46rem]:items-center"
        >
          <!-- Search -->
          <div class="relative min-w-0">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              v-model="schoolSearch"
              placeholder="Tìm trường học..."
              aria-label="Tìm trường học"
              class="w-full min-w-0 truncate pl-9 pr-3 text-sm"
            />
          </div>

          <!-- Region filter -->
          <Select v-model="selectedRegion">
            <SelectTrigger
              class="w-full min-w-0 gap-2"
              aria-label="Lọc theo khu vực"
            >
              <SelectValue placeholder="Khu vực" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả khu vực</SelectItem>
              <SelectItem value="Miền Bắc">Miền Bắc</SelectItem>
              <SelectItem value="Miền Trung">Miền Trung</SelectItem>
              <SelectItem value="Miền Nam">Miền Nam</SelectItem>
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

          <!-- Export report -->
          <Button
            type="button"
            variant="outline"
            class="w-full min-w-0 gap-2 @[46rem]:col-start-5 @[46rem]:w-auto"
            @click="exportCSV"
          >
            <Download class="size-4 shrink-0" />

            <span class="min-w-0 truncate"> Xuất báo cáo </span>
          </Button>
        </div>
      </div>

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
                class="h-auto whitespace-normal px-2 py-2"
                :class="
                  isNumericColumn(header.column.id)
                    ? 'text-center'
                    : 'text-left'
                "
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
                    class="h-auto min-h-8 w-full min-w-0 gap-1 px-1 whitespace-normal"
                    :class="
                      isNumericColumn(header.column.id)
                        ? 'justify-center'
                        : 'justify-start'
                    "
                    @click="header.column.toggleSorting()"
                  >
                    <span
                      class="min-w-0 whitespace-normal leading-tight"
                      :class="
                        isNumericColumn(header.column.id)
                          ? 'text-center'
                          : 'text-left'
                      "
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
              </TableHead>
            </TableRow>
          </TableHeader>

          <!-- Table body -->
          <TableBody>
            <template v-if="table.getRowModel().rows.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.original.id"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-2 py-3 tabular-nums"
                  :class="
                    isNumericColumn(cell.column.id)
                      ? 'text-center'
                      : 'text-left'
                  "
                >
                  <!-- School name -->
                  <span
                    v-if="cell.column.id === 'school'"
                    class="whitespace-normal wrap-break-word font-medium"
                  >
                    {{ row.original.school }}
                  </span>

                  <!-- Region badge -->
                  <Badge
                    v-else-if="cell.column.id === 'region'"
                    variant="secondary"
                    class="whitespace-nowrap"
                  >
                    {{ row.original.region }}
                  </Badge>

                  <!-- Missing registrations -->
                  <span
                    v-else-if="cell.column.id === 'shortfall'"
                    class="font-medium text-destructive"
                  >
                    {{ numberFormatter.format(row.original.shortfall) }}
                  </span>

                  <!-- Conversion rate -->
                  <span v-else-if="cell.column.id === 'conversion'">
                    {{ numberFormatter.format(row.original.conversion) }}%
                  </span>

                  <!-- Overdue days -->
                  <template v-else-if="cell.column.id === 'overdueDays'">
                    <span
                      v-if="row.original.overdueDays !== null"
                      class="inline-flex items-center justify-center gap-1 whitespace-nowrap text-destructive"
                    >
                      <AlertTriangle
                        class="size-3.5 shrink-0"
                        aria-hidden="true"
                      />

                      {{ row.original.overdueDays }}
                    </span>

                    <span v-else class="text-muted-foreground"> — </span>
                  </template>
                </TableCell>
              </TableRow>
            </template>

            <!-- Empty state -->
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
        :page-count="table.getPageCount()"
        :page-size="table.atoms.pagination.get().pageSize"
        :total="table.getFilteredRowModel().rows.length"
        item-label="trường"
        @update:page="table.setPageIndex($event - 1)"
        @update:page-size="changePageSize"
      />
    </CardContent>
  </Card>
</template>
