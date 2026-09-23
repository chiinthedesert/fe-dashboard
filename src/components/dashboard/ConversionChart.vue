<script setup lang="ts">
import { computed } from "vue";

import type { ConversionFunnelResponse } from "@/types/dashboard-api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Props

const props = defineProps<{
  data: ConversionFunnelResponse | null;
  loading: boolean;
  error: string;
}>();

// Chart data

const chartData = computed(() => {
  const stages = [...(props.data?.stages ?? [])].sort(
    (a, b) => a.stage - b.stage,
  );

  const firstCount = stages[0]?.count ?? 0;

  return stages.map((item, index) => {
    const previousCount = stages[index - 1]?.count ?? 0;

    return {
      ...item,

      // Bar width

      percentage:
        firstCount > 0
          ? Math.min(100, Math.max(0, (item.count / firstCount) * 100))
          : 0,

      // Conversion from previous stage

      conversion:
        index > 0 && previousCount > 0
          ? (item.count / previousCount) * 100
          : null,
    };
  });
});

// Number formatting

function formatNumber(value: number): string {
  return value.toLocaleString("vi-VN");
}

function formatPercentage(value: number): string {
  return `${value.toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
</script>

<template>
  <Card class="min-w-0 w-full">
    <!-- Card header -->

    <CardHeader>
      <CardTitle> Phễu chuyển đổi </CardTitle>

      <CardDescription> Tiếp cận → Đăng ký → Tham gia </CardDescription>
    </CardHeader>

    <!-- Chart content -->

    <CardContent class="min-w-0">
      <div
        v-if="loading"
        class="flex h-64 items-center justify-center text-sm text-muted-foreground"
      >
        Đang tải dữ liệu...
      </div>

      <p
        v-else-if="error"
        role="alert"
        class="flex h-64 items-center justify-center text-center text-sm text-destructive"
      >
        {{ error }}
      </p>

      <div
        v-else-if="chartData.length === 0"
        class="flex h-64 items-center justify-center text-sm text-muted-foreground"
      >
        Không có dữ liệu chuyển đổi trong khoảng thời gian này.
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="item in chartData"
          :key="item.stage"
          class="flex flex-col gap-2"
        >
          <!-- Stage name and count -->

          <div class="flex items-center justify-between gap-4 text-sm">
            <span class="font-medium">
              {{ item.name }}
            </span>

            <span class="font-medium tabular-nums">
              {{ formatNumber(item.count) }}
            </span>
          </div>

          <!-- Horizontal bar -->

          <div class="h-6 w-full overflow-hidden rounded-lg">
            <div
              class="h-full rounded-lg bg-chart-1"
              :style="{
                width: `${item.percentage}%`,
              }"
            />
          </div>

          <!-- Conversion rate -->

          <p class="text-xs text-muted-foreground">
            <template v-if="item.conversion !== null">
              {{ formatPercentage(item.conversion) }}
              so với giai đoạn trước
            </template>

            <template v-else> Tổng số tiếp cận </template>
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
