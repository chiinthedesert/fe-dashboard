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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TablePagination from "@/components/shared/TablePagination.vue";

// Props

interface SchoolRow {
  school: string;
  count: number;
  percentage: number;
}

const props = defineProps<{
  schools: SchoolRow[];
  totalCandidates: number;
}>();

// Formatters

const numberFormatter = new Intl.NumberFormat("vi-VN");

const percentageFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
});

function formatPercentage(value: number): string {
  return `${percentageFormatter.format(value)}%`;
}

function isNumericColumn(id: string): boolean {
  return ["count", "percentage"].includes(id);
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
  },

  sortFns: {
    text: sortFn_text,
    basic: sortFn_basic,
  },
});

const columnHelper = createColumnHelper<typeof features, SchoolRow>();

// Table columns

const columns = columnHelper.columns([
  columnHelper.accessor("school", {
    header: "Trường học",
    enableHiding: false,
    filterFn: "includesString",
    sortFn: "text",
  }),

  columnHelper.accessor("count", {
    header: "Số thí sinh",
    sortFn: "basic",
  }),

  columnHelper.accessor("percentage", {
    header: "Tỷ trọng",
    sortFn: "basic",
  }),
]);

// Table instance

const table = useTable({
  features,

  data: computed(() => props.schools),

  columns,

  initialState: {
    sorting: [
      {
        id: "count",
        desc: true,
      },
    ],

    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
});

// School search

const schoolSearch = computed({
  get: () => String(table.getColumn("school")?.getFilterValue() ?? ""),

  set: (value: string) => {
    table.getColumn("school")?.setFilterValue(value);

    table.setPageIndex(0);
  },
});

// Pagination

function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <!-- Table header -->

    <CardHeader class="px-4">
      <CardTitle> Thống kê theo trường học </CardTitle>

      <CardDescription>
        Số lượng thí sinh đăng ký theo từng trường học. Thống kê trên toàn bộ dữ
        liệu, không áp dụng bộ lọc thời gian của dashboard.
      </CardDescription>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <!-- Search and column visibility -->

      <div class="@container min-w-0">
        <div
          class="grid min-w-0 grid-cols-2 gap-3 @[36rem]:grid-cols-[minmax(12rem,20rem)_10rem] @[36rem]:justify-start"
        >
          <!-- Search -->

          <div class="relative col-span-2 min-w-0 @[36rem]:col-span-1">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              v-model="schoolSearch"
              placeholder="Tìm trường học..."
              aria-label="Tìm trường học"
              class="w-full min-w-0 truncate pr-3 pl-9 text-sm"
            />
          </div>

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
        </div>
      </div>

      <!-- School table -->

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
                class="h-auto px-3 py-2 whitespace-normal"
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
              </TableHead>
            </TableRow>
          </TableHeader>

          <!-- Table body -->

          <TableBody>
            <template v-if="table.getRowModel().rows.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.original.school"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-3 py-3 tabular-nums"
                  :class="
                    isNumericColumn(cell.column.id)
                      ? 'text-center'
                      : 'text-left'
                  "
                >
                  <!-- School name -->

                  <span
                    v-if="cell.column.id === 'school'"
                    class="font-medium whitespace-normal wrap-break-word"
                  >
                    {{ row.original.school }}
                  </span>

                  <!-- Candidate count -->

                  <span
                    v-else-if="cell.column.id === 'count'"
                    class="font-medium"
                  >
                    {{ numberFormatter.format(row.original.count) }}
                  </span>

                  <!-- Percentage -->

                  <span v-else-if="cell.column.id === 'percentage'">
                    {{ formatPercentage(row.original.percentage) }}
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
                Không tìm thấy trường học.
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
        item-label="trường"
        @update:page="table.setPageIndex($event - 1)"
        @update:page-size="changePageSize"
      />

      <!-- Overall total -->

      <p class="text-sm text-muted-foreground">
        Tổng số thí sinh:
        <span class="font-medium text-foreground tabular-nums">
          {{ numberFormatter.format(totalCandidates) }}
        </span>
      </p>
    </CardContent>
  </Card>
</template>
