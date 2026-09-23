<script setup lang="ts">
import { computed, ref } from "vue";

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

import { getLastDaysRange } from "@/lib/dashboard-date";

import type { DashboardFilter } from "@/types/dashboard-api";

// Props and events

const props = defineProps<{
  modelValue: DashboardFilter;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: DashboardFilter];
}>();

// Filter state

const filtersOpen = ref(false);

const customEditorOpen = ref(false);

const customFrom = ref(props.modelValue.from ?? "");
const customTo = ref(props.modelValue.to ?? "");

// Period selection

const period = computed(() => {
  if (customEditorOpen.value) {
    return "custom";
  }

  const { from, to } = props.modelValue;

  if (!from && !to) {
    return "all";
  }

  if (from && to) {
    const last7Days = getLastDaysRange(7);
    const last30Days = getLastDaysRange(30);

    if (from === last7Days.from && to === last7Days.to) {
      return "7d";
    }

    if (from === last30Days.from && to === last30Days.to) {
      return "30d";
    }
  }

  return "custom";
});

function changePeriod(value: string) {
  if (value === "custom") {
    customEditorOpen.value = true;

    customFrom.value = props.modelValue.from ?? "";
    customTo.value = props.modelValue.to ?? "";

    return;
  }

  customEditorOpen.value = false;

  if (value === "7d") {
    emit("update:modelValue", getLastDaysRange(7));
    return;
  }

  if (value === "30d") {
    emit("update:modelValue", getLastDaysRange(30));
    return;
  }

  if (value === "all") {
    emit("update:modelValue", {});
  }
}

// Custom date range

function applyCustomRange() {
  if (!customFrom.value || !customTo.value) {
    return;
  }

  if (customFrom.value > customTo.value) {
    return;
  }

  emit("update:modelValue", {
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
    <!-- Mobile filter toggle -->

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

    <!-- Filter controls -->

    <div
      id="dashboard-filters"
      class="w-full min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid sm:w-auto sm:grid-cols-[repeat(2,12rem)] lg:grid-cols-[repeat(3,12rem)]"
      :class="filtersOpen ? 'grid' : 'hidden'"
    >
      <!-- Region -->

      <Select model-value="all" disabled>
        <SelectTrigger class="w-full" aria-label="Khu vực">
          <SelectValue placeholder="Chọn khu vực" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Toàn quốc</SelectItem>
          <SelectItem value="north">Miền Bắc</SelectItem>
          <SelectItem value="central">Miền Trung</SelectItem>
          <SelectItem value="south">Miền Nam</SelectItem>
        </SelectContent>
      </Select>

      <!-- Exam board -->

      <Select model-value="all" disabled>
        <SelectTrigger class="w-full" aria-label="Bảng thi">
          <SelectValue placeholder="Chọn bảng thi" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Tất cả bảng thi</SelectItem>
          <SelectItem value="A">Bảng A</SelectItem>
          <SelectItem value="B">Bảng B</SelectItem>
        </SelectContent>
      </Select>

      <!-- Time range -->

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

      <!-- Custom date range -->

      <div
        v-if="period === 'custom'"
        class="grid min-w-0 grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2 lg:col-span-3"
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
