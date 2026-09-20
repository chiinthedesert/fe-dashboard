<script setup lang="ts">
import { computed, ref, watch } from "vue";
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

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-vue-next";

import { regionData } from "@/mocks/dashboardCharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

type RegionRow = (typeof regionData)[number];

const numberFormatter = new Intl.NumberFormat("vi-VN");
function isNumericColumn(id: string) {
  return ["registrations", "target", "conversion"].includes(id);
}

const columnLabels: Record<string, string> = {
  city: "Tỉnh / Thành",
  region: "Khu vực",
  registrations: "Đăng ký",
  target: "Chỉ tiêu",
  progress: "Tiến độ",
  conversion: "Tỷ lệ chuyển đổi",
};

function getProgress(row: RegionRow) {
  return row.target > 0 ? (row.registrations / row.target) * 100 : null;
}

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

const columnHelper = createColumnHelper<typeof features, RegionRow>();

const columns = columnHelper.columns([
  columnHelper.accessor("city", {
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

  columnHelper.accessor("target", {
    header: "Chỉ tiêu",
    sortFn: "basic",
  }),

  columnHelper.accessor((row) => getProgress(row) ?? undefined, {
    id: "progress",
    header: "Tiến độ",
    sortFn: "basic",
    sortUndefined: "last",
  }),

  columnHelper.accessor("conversion", {
    header: "Tỷ lệ chuyển đổi",
    sortFn: "basic",
  }),
]);

const table = useTable({
  features,
  data: regionData,
  columns,

  initialState: {
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
});

const citySearch = computed({
  get: () => String(table.getColumn("city")?.getFilterValue() ?? ""),
  set: (value: string) => {
    table.getColumn("city")?.setFilterValue(value);
    table.setPageIndex(0);
  },
});

const selectedRegion = computed({
  get: () => String(table.getColumn("region")?.getFilterValue() ?? "all"),
  set: (value: string) => {
    table
      .getColumn("region")
      ?.setFilterValue(value === "all" ? undefined : value);

    table.setPageIndex(0);
  },
});

function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}

const currentPage = computed(() => table.atoms.pagination.get().pageIndex + 1);

const pageInput = ref<string | number>(currentPage.value);

// Keep the input updated after filtering or using Previous/Next.
watch(currentPage, (page) => {
  pageInput.value = page;
});
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <CardHeader class="px-4">
      <CardTitle>Chi tiết theo tỉnh / thành</CardTitle>
      <CardDescription>Tiến độ đăng ký so với chỉ tiêu</CardDescription>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <!-- Search and controls -->
      <div
        class="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-[minmax(12rem,20rem)_10rem_auto] lg:justify-start"
      >
        <Input
          v-model="citySearch"
          placeholder="Tìm tỉnh / thành..."
          aria-label="Tìm tỉnh hoặc thành phố"
          class="col-span-2 w-full min-w-0 lg:col-span-1"
        />

        <Select v-model="selectedRegion">
          <SelectTrigger class="w-full min-w-0" aria-label="Lọc theo khu vực">
            <SelectValue placeholder="Khu vực" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Tất cả khu vực</SelectItem>
            <SelectItem value="Miền Bắc">Miền Bắc</SelectItem>
            <SelectItem value="Miền Trung">Miền Trung</SelectItem>
            <SelectItem value="Miền Nam">Miền Nam</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="outline"
              class="w-full min-w-0 gap-2"
            >
              <span class="truncate">Hiển thị cột</span>
              <ChevronDown class="size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" :side-offset="4" class="w-48">
            <DropdownMenuCheckboxItem
              v-for="column in table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())"
              :key="column.id"
              :model-value="column.getIsVisible()"
              @update:model-value="(value) => column.toggleVisibility(!!value)"
              @select.prevent
            >
              {{ columnLabels[column.id] ?? column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Horizontal scrolling on narrow screens -->
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
                    class="h-auto min-h-8 w-full min-w-0 justify-start gap-1 whitespace-normal"
                    @click="header.column.toggleSorting()"
                  >
                    <span
                      class="min-w-0 whitespace-normal text-left leading-tight"
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
            <template v-if="table.getRowModel().rows.length">
              <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
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
                  <span
                    v-if="cell.column.id === 'city'"
                    class="whitespace-normal font-medium"
                  >
                    {{ row.original.city }}
                  </span>

                  <Badge
                    v-else-if="cell.column.id === 'region'"
                    variant="secondary"
                    class="whitespace-nowrap"
                  >
                    {{ row.original.region }}
                  </Badge>

                  <template v-else-if="cell.column.id === 'progress'">
                    <div
                      v-if="getProgress(row.original) !== null"
                      class="flex min-w-28 items-center gap-2"
                    >
                      <Progress
                        :model-value="
                          Math.min(
                            100,
                            Math.max(0, getProgress(row.original) ?? 0),
                          )
                        "
                        :aria-label="`Tiến độ ${row.original.city}`"
                        class="h-2 w-20 shrink-0"
                      />

                      <span class="text-xs tabular-nums text-muted-foreground">
                        {{ Math.round(getProgress(row.original) ?? 0) }}%
                      </span>
                    </div>

                    <span v-else class="text-muted-foreground">—</span>
                  </template>

                  <span v-else-if="cell.column.id === 'conversion'">
                    {{ numberFormatter.format(row.original.conversion) }}%
                  </span>

                  <span v-else>
                    {{ numberFormatter.format(Number(cell.getValue())) }}
                  </span>
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

      <!-- Row count and pagination -->
      <TablePagination
        :page="table.atoms.pagination.get().pageIndex + 1"
        :page-count="table.getPageCount()"
        :page-size="table.atoms.pagination.get().pageSize"
        :total="table.getFilteredRowModel().rows.length"
        item-label="tỉnh"
        @update:page="table.setPageIndex($event - 1)"
        @update:page-size="changePageSize"
      />
    </CardContent>
  </Card>
</template>
