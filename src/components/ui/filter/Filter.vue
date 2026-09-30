<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { ChevronDown } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getCandidateSales } from "@/services/candidates";
import { getLastDaysRange } from "@/lib/dashboard-date";

import type { StaffOptionResponse } from "@/types/candidate-api";
import type { DashboardFilter } from "@/types/dashboard-api";

const props = defineProps<{
  modelValue: DashboardFilter;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: DashboardFilter];
}>();

const filtersOpen = ref(false);
const customEditorOpen = ref(false);
const customFrom = ref(props.modelValue.from ?? "");
const customTo = ref(props.modelValue.to ?? "");

const sales = ref<StaffOptionResponse[]>([]);
const salesLoading = ref(false);
const salesError = ref("");

onMounted(async () => {
  salesLoading.value = true;
  salesError.value = "";

  try {
    sales.value = await getCandidateSales();
  } catch (error) {
    salesError.value =
      error instanceof Error
        ? error.message
        : "Không thể tải danh sách nhân viên Sale.";
  } finally {
    salesLoading.value = false;
  }
});

const sortedSales = computed(() =>
  [...sales.value].sort((a, b) =>
    (a.hoTen ?? "").localeCompare(b.hoTen ?? "", "vi"),
  ),
);

const period = computed(() => {
  if (customEditorOpen.value) return "custom";

  const { from, to } = props.modelValue;

  if (!from && !to) return "all";

  if (from && to) {
    const last7Days = getLastDaysRange(7);
    const last30Days = getLastDaysRange(30);

    if (from === last7Days.from && to === last7Days.to) return "7d";
    if (from === last30Days.from && to === last30Days.to) return "30d";
  }

  return "custom";
});

function emitFilter(next: DashboardFilter) {
  emit("update:modelValue", next);
}

function changeSale(value: string) {
  const next = { ...props.modelValue };

  if (value === "all") delete next.saleId;
  else next.saleId = Number(value);

  emitFilter(next);
}

function changePeriod(value: string) {
  if (value === "custom") {
    customEditorOpen.value = true;
    customFrom.value = props.modelValue.from ?? "";
    customTo.value = props.modelValue.to ?? "";
    return;
  }

  customEditorOpen.value = false;

  const next = { ...props.modelValue };
  delete next.from;
  delete next.to;

  if (value === "7d") {
    Object.assign(next, getLastDaysRange(7));
  } else if (value === "30d") {
    Object.assign(next, getLastDaysRange(30));
  }

  emitFilter(next);
}

function applyCustomRange() {
  if (!customFrom.value || !customTo.value) return;
  if (customFrom.value > customTo.value) return;

  emitFilter({
    ...props.modelValue,
    from: customFrom.value,
    to: customTo.value,
  });

  customEditorOpen.value = false;
}
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-xl border bg-card p-2 sm:flex-row sm:items-start sm:p-4"
  >
    <Button
      type="button"
      variant="ghost"
      class="w-full justify-between px-2 sm:hidden"
      :aria-expanded="filtersOpen"
      aria-controls="dashboard-filters"
      @click="filtersOpen = !filtersOpen"
    >
      Bộ lọc
      <ChevronDown
        class="size-4 transition-transform"
        :class="{ 'rotate-180': filtersOpen }"
      />
    </Button>

    <span
      class="hidden shrink-0 text-sm font-medium text-muted-foreground sm:block sm:pt-2"
    >
      Bộ lọc
    </span>

    <div
      id="dashboard-filters"
      class="w-full min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid sm:w-auto sm:grid-cols-[repeat(2,12rem)]"
      :class="filtersOpen ? 'grid' : 'hidden'"
    >
      <Select
        :model-value="modelValue.saleId != null ? String(modelValue.saleId) : 'all'"
        :disabled="salesLoading || !!salesError"
        @update:model-value="(value) => changeSale(String(value ?? 'all'))"
      >
        <SelectTrigger class="w-full" aria-label="Nhân viên Sale">
          <SelectValue
            :placeholder="salesLoading ? 'Đang tải Sale...' : 'Nhân viên Sale'"
          />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Tất cả Sale</SelectItem>
          <SelectItem
            v-for="sale in sortedSales"
            :key="sale.id"
            :value="String(sale.id)"
          >
            {{ sale.hoTen || sale.idNhanVien || `Sale #${sale.id}` }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        :model-value="period"
        @update:model-value="(value) => changePeriod(String(value ?? ''))"
      >
        <SelectTrigger class="w-full" aria-label="Khoảng thời gian">
          <SelectValue placeholder="Chọn thời gian" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="30d">30 ngày qua</SelectItem>
          <SelectItem value="7d">7 ngày qua</SelectItem>
          <SelectItem value="all">Từ đầu chương trình</SelectItem>
          <SelectItem value="custom">Tuỳ chỉnh</SelectItem>
        </SelectContent>
      </Select>

      <p
        v-if="salesError"
        role="alert"
        class="text-xs text-destructive sm:col-span-2"
      >
        {{ salesError }}
      </p>

      <div
        v-if="period === 'custom'"
        class="grid min-w-0 grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2"
      >
        <div class="grid min-w-0 gap-2">
          <label for="dashboard-from" class="text-sm font-medium">
            Từ ngày
          </label>
          <Input
            id="dashboard-from"
            v-model="customFrom"
            type="date"
            class="w-full min-w-0"
            :max="customTo || undefined"
          />
        </div>

        <div class="grid min-w-0 gap-2">
          <label for="dashboard-to" class="text-sm font-medium">
            Đến ngày
          </label>
          <Input
            id="dashboard-to"
            v-model="customTo"
            type="date"
            class="w-full min-w-0"
            :min="customFrom || undefined"
          />
        </div>

        <p
          v-if="customFrom && customTo && customFrom > customTo"
          class="text-sm text-destructive sm:col-span-2"
        >
          Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.
        </p>

        <div class="sm:col-span-2">
          <Button
            type="button"
            :disabled="!customFrom || !customTo || customFrom > customTo"
            @click="applyCustomRange"
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
