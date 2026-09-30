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

import type { DashboardTopPartnerItem } from "@/types/dashboard-api";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/shared/TablePagination.vue";

const props = defineProps<{
  partners: DashboardTopPartnerItem[];
  totalCandidatesInTop: number;
  loading: boolean;
  error: string;
}>();

type PartnerRow = DashboardTopPartnerItem & { rank: number };

const rows = computed<PartnerRow[]>(() =>
  props.partners.map((partner, index) => ({
    ...partner,
    rank: index + 1,
  })),
);

const numberFormatter = new Intl.NumberFormat("vi-VN");

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

const columnHelper = createColumnHelper<typeof features, PartnerRow>();

const columns = columnHelper.columns([
  columnHelper.accessor("rank", {
    header: "Hạng",
    sortFn: "basic",
  }),
  columnHelper.accessor("name", {
    header: "Trường / Đối tác",
    enableHiding: false,
    filterFn: "includesString",
    sortFn: "text",
  }),
  columnHelper.accessor("candidateCount", {
    header: "Số thí sinh",
    sortFn: "basic",
  }),
  columnHelper.accessor("status", {
    header: "Trạng thái",
    sortFn: "text",
  }),
]);

const table = useTable({
  features,
  data: rows,
  columns,
  initialState: {
    sorting: [{ id: "candidateCount", desc: true }],
    pagination: { pageIndex: 0, pageSize: 10 },
  },
});

const partnerSearch = computed({
  get: () => String(table.getColumn("name")?.getFilterValue() ?? ""),
  set: (value: string) => {
    table.getColumn("name")?.setFilterValue(value);
    table.setPageIndex(0);
  },
});

function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}

function isCenteredColumn(id: string): boolean {
  return id === "rank" || id === "candidateCount" || id === "status";
}
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <CardHeader class="px-4">
      <CardTitle>Top trường / đối tác</CardTitle>
      <CardDescription>
        Các trường hoặc đơn vị giới thiệu nhiều thí sinh nhất theo bộ lọc dashboard.
      </CardDescription>
      <p v-if="!loading && !error" class="text-xs text-muted-foreground">
        Tổng thí sinh trong danh sách top:
        <span class="font-medium text-foreground tabular-nums">
          {{ numberFormatter.format(totalCandidatesInTop) }}
        </span>
      </p>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <div class="@container min-w-0">
        <div
          class="grid min-w-0 grid-cols-2 gap-3 @[36rem]:grid-cols-[minmax(12rem,20rem)_10rem] @[36rem]:justify-start"
        >
          <div class="relative col-span-2 min-w-0 @[36rem]:col-span-1">
            <Search
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              v-model="partnerSearch"
              placeholder="Tìm trường / đối tác..."
              aria-label="Tìm trường hoặc đối tác"
              class="w-full min-w-0 truncate pr-3 pl-9 text-sm"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                type="button"
                variant="outline"
                class="w-full min-w-0 justify-between gap-2 px-3 font-normal"
              >
                <span class="min-w-0 truncate">Hiển thị cột</span>
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
                class="h-auto px-3 py-2 whitespace-normal"
                :class="isCenteredColumn(header.column.id) ? 'text-center' : 'text-left'"
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
                      isCenteredColumn(header.column.id)
                        ? 'justify-center'
                        : 'justify-start'
                    "
                    @click="header.column.toggleSorting()"
                  >
                    <span
                      class="min-w-0 leading-tight whitespace-normal"
                      :class="
                        isCenteredColumn(header.column.id)
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

          <TableBody>
            <TableRow v-if="loading">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-24 text-center text-muted-foreground"
              >
                Đang tải dữ liệu trường / đối tác...
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
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  class="px-3 py-3"
                  :class="isCenteredColumn(cell.column.id) ? 'text-center' : 'text-left'"
                >
                  <span
                    v-if="cell.column.id === 'name'"
                    class="font-medium whitespace-normal wrap-break-word"
                  >
                    {{ row.original.name || "—" }}
                  </span>

                  <span
                    v-else-if="cell.column.id === 'candidateCount'"
                    class="font-medium tabular-nums"
                  >
                    {{ numberFormatter.format(row.original.candidateCount) }}
                  </span>

                  <Badge
                    v-else-if="cell.column.id === 'status' && row.original.status"
                    variant="outline"
                  >
                    {{ row.original.status }}
                  </Badge>

                  <span v-else class="text-muted-foreground tabular-nums">
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
                Không có dữ liệu trường / đối tác.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <TablePagination
        :page="table.atoms.pagination.get().pageIndex + 1"
        :page-count="Math.max(1, table.getPageCount())"
        :page-size="table.atoms.pagination.get().pageSize"
        :total="table.getFilteredRowModel().rows.length"
        item-label="đơn vị"
        @update:page="table.setPageIndex($event - 1)"
        @update:page-size="changePageSize"
      />
    </CardContent>
  </Card>
</template>
