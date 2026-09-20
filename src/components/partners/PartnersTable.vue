<script setup lang="ts">
import { computed, ref, watch } from "vue";

import {
  FlexRender,
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/vue-table";

import { ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-vue-next";

import type { Partner } from "@/types/partner";

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
  partners: Partner[];
}>();

const emit = defineEmits<{
  add: [];
  edit: [partner: Partner];
  delete: [partner: Partner];
}>();

// Search and filtering
const partnerSearch = ref("");
const selectedType = ref("all");

const filteredPartners = computed(() => {
  const search = partnerSearch.value.trim().toLocaleLowerCase("vi-VN");

  return props.partners.filter((partner) => {
    const matchesType =
      selectedType.value === "all" || partner.type === selectedType.value;

    const matchesSearch =
      !search ||
      [
        partner.name,
        partner.contactName,
        partner.email,
        partner.phone,
        partner.notes,
      ].some((value) => value.toLocaleLowerCase("vi-VN").includes(search));

    return matchesType && matchesSearch;
  });
});

// Table features
const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,

  paginatedRowModel: createPaginatedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, Partner>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Tên đơn vị",
    enableHiding: false,
  }),

  columnHelper.accessor("type", {
    header: "Phân loại",
  }),

  columnHelper.accessor("contactName", {
    header: "Người liên hệ",
  }),

  columnHelper.accessor("email", {
    header: "Email",
  }),

  columnHelper.accessor("phone", {
    header: "Số điện thoại",
  }),

  columnHelper.accessor("notes", {
    header: "Ghi chú",
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
  data: filteredPartners,
  columns,

  initialState: {
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
  },
});

// Reset pagination after searching or filtering
watch([partnerSearch, selectedType], () => {
  table.setPageIndex(0);
});

// Keep the current page valid after deleting partners
watch(
  () => filteredPartners.value.length,
  () => {
    const { pageIndex, pageSize } = table.atoms.pagination.get();

    const lastPage = Math.max(
      0,
      Math.ceil(filteredPartners.value.length / pageSize) - 1,
    );

    if (pageIndex > lastPage) {
      table.setPageIndex(lastPage);
    }
  },
);

// Change page size
function changePageSize(size: number) {
  table.setPageSize(size);
  table.setPageIndex(0);
}
</script>

<template>
  <Card class="min-w-0 w-full gap-4 py-4">
    <!-- Card header -->
    <CardHeader class="px-4">
      <CardTitle>Danh sách đối tác và doanh nghiệp</CardTitle>

      <CardDescription>
        Quản lý đơn vị phối hợp, tài trợ và các đầu mối liên hệ của cuộc thi.
      </CardDescription>
    </CardHeader>

    <CardContent class="min-w-0 space-y-4 px-4">
      <!-- Search, filter and actions -->
      <div
        class="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-[minmax(12rem,20rem)_10rem_auto_minmax(0,1fr)_auto] lg:items-center"
      >
        <!-- Search -->
        <div class="relative min-w-0">
          <Search
            class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            v-model="partnerSearch"
            placeholder="Tìm tên, liên hệ, ghi chú..."
            aria-label="Tìm kiếm đối tác"
            class="w-full min-w-0 pl-9"
          />
        </div>

        <!-- Partner type filter -->
        <Select v-model="selectedType">
          <SelectTrigger
            class="w-full min-w-0"
            aria-label="Lọc theo phân loại đối tác"
          >
            <SelectValue placeholder="Tất cả loại" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="Trường học">Trường học</SelectItem>
            <SelectItem value="Doanh nghiệp">Doanh nghiệp</SelectItem>
          </SelectContent>
        </Select>

        <!-- Column visibility -->
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
              {{ column.columnDef.header }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Add partner -->
        <Button
          type="button"
          class="w-full min-w-0 gap-2 lg:col-start-5 lg:w-auto"
          @click="emit('add')"
        >
          <Plus class="size-4 shrink-0" />
          <span class="truncate">Thêm đối tác</span>
        </Button>
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
                class="h-auto whitespace-normal px-3 py-2 text-left"
                :class="{
                  'min-w-36': header.column.id === 'notes',
                }"
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
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
                  class="px-3 py-3 whitespace-normal"
                >
                  <!-- Partner name -->
                  <span v-if="cell.column.id === 'name'" class="font-medium">
                    {{ row.original.name }}
                  </span>

                  <!-- Partner type -->
                  <Badge
                    v-else-if="cell.column.id === 'type'"
                    variant="secondary"
                    class="whitespace-nowrap"
                  >
                    {{ row.original.type }}
                  </Badge>

                  <!-- Notes -->
                  <span
                    v-else-if="cell.column.id === 'notes'"
                    class="text-muted-foreground"
                  >
                    {{ row.original.notes || "—" }}
                  </span>

                  <!-- Actions -->
                  <div
                    v-else-if="cell.column.id === 'actions'"
                    class="flex items-center justify-center gap-1"
                  >
                    <!-- Edit -->
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      :aria-label="`Chỉnh sửa ${row.original.name}`"
                      @click="emit('edit', row.original)"
                    >
                      <Pencil class="size-4" />
                    </Button>

                    <!-- Delete -->
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
                    :class="{
                      'text-muted-foreground':
                        cell.column.id === 'email' ||
                        cell.column.id === 'phone',
                    }"
                  >
                    {{ cell.getValue() }}
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

      <!-- Pagination -->
      <TablePagination
        :page="table.atoms.pagination.get().pageIndex + 1"
        :page-count="Math.max(1, table.getPageCount())"
        :page-size="table.atoms.pagination.get().pageSize"
        :total="filteredPartners.length"
        item-label="đối tác"
        @update:page="table.setPageIndex($event - 1)"
        @update:page-size="changePageSize"
      />
    </CardContent>
  </Card>
</template>
