<script setup lang="ts">
import { computed } from "vue";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { conversionChartData } from "@/mocks/dashboardCharts";

const chartData = computed(() => {
  const firstCount = conversionChartData[0]?.count ?? 0;

  return conversionChartData.map((item, index) => {
    const previousCount = conversionChartData[index - 1]?.count ?? 0;

    return {
      ...item,

      // Bar width relative to the first stage
      percentage: firstCount > 0 ? (item.count / firstCount) * 100 : 0,

      // Conversion rate from the previous stage
      conversion:
        index > 0 && previousCount > 0
          ? (item.count / previousCount) * 100
          : null,
    };
  });
});
</script>

<template>
  <Card class="min-w-0 w-full">
    <CardHeader>
      <CardTitle>Phễu chuyển đổi</CardTitle>

      <CardDescription> Tiếp cận → Đăng ký → Tham gia </CardDescription>
    </CardHeader>

    <CardContent class="min-w-0">
      <div class="flex flex-col gap-4">
        <div
          v-for="item in chartData"
          :key="item.key"
          class="flex flex-col gap-2"
        >
          <!-- Stage name and count -->
          <div class="flex items-center justify-between gap-4 text-sm">
            <span class="font-medium">
              {{ item.label }}
            </span>

            <span class="font-medium tabular-nums">
              {{ item.count }}
            </span>
          </div>

          <!-- Horizontal bar -->
          <div class="h-6 w-full overflow-hidden bg-muted">
            <div
              class="h-full rounded-lg bg-chart-1"
              :style="{ width: `${item.percentage}%` }"
            />
          </div>

          <!-- Conversion rate -->
          <p class="text-xs text-muted-foreground">
            <template v-if="item.conversion !== null">
              {{ item.conversion.toFixed(1) }}% so với giai đoạn trước
            </template>

            <template v-else> Tổng số tiếp cận </template>
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
