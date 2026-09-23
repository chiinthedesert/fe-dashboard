<script setup lang="ts">
import { computed } from "vue";

import type { ChartConfig } from "@/components/ui/chart";
import type { DashboardRegion } from "@/types/dashboard-api";

import { Donut } from "@unovis/ts";
import { VisDonut, VisSingleContainer } from "@unovis/vue";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from "@/components/ui/chart";

// Props

const props = defineProps<{
  regions: DashboardRegion[];
}>();

// Chart data

const chartData = computed(() =>
  props.regions
    .filter((region) => region.count > 0)
    .map((region, index) => ({
      ...region,
      key: `region${index}`,
      fill: `var(--color-region${index})`,
    })),
);

type Data = (typeof chartData.value)[number];

// Chart configuration

const chartConfig = computed<ChartConfig>(() => {
  const config: ChartConfig = {
    count: {
      label: "Số thí sinh",
    },
  };

  chartData.value.forEach((region, index) => {
    config[region.key] = {
      label: region.regionName,
      color: `var(--chart-${(index % 5) + 1})`,
    };
  });

  return config;
});

// Summary

const total = computed(() =>
  chartData.value.reduce((sum, region) => sum + region.count, 0),
);

// Formatters

const numberFormatter = new Intl.NumberFormat("vi-VN");

const percentageFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
});

function formatPercentage(value: number): string {
  return `${percentageFormatter.format(value)}%`;
}
</script>

<template>
  <Card class="flex min-w-0 flex-col gap-4">
    <!-- Chart header -->

    <CardHeader>
      <CardTitle> Phân bố thí sinh theo khu vực </CardTitle>

      <CardDescription>
        Số lượng và tỷ trọng thí sinh trong khoảng thời gian đã chọn
      </CardDescription>
    </CardHeader>

    <!-- Chart content -->

    <CardContent class="min-w-0">
      <!-- Empty state -->

      <div
        v-if="total === 0"
        class="flex h-64 items-center justify-center text-sm text-muted-foreground"
      >
        Không có dữ liệu khu vực trong khoảng thời gian này.
      </div>

      <!-- Pie chart and legend -->
      <div
        v-else
        class="grid min-w-0 grid-cols-1 items-center gap-6 md:grid-cols-2"
      >
        <!-- Pie chart -->
        <ChartContainer
          :config="chartConfig"
          class="aspect-auto h-64 w-full min-w-0"
        >
          <VisSingleContainer
            :data="chartData"
            :margin="{ top: 20, bottom: 20 }"
          >
            <VisDonut
              :value="(d: Data) => d.count"
              :color="(d: Data) => d.fill"
              :arc-width="0"
            />

            <ChartTooltip
              :triggers="{
                [Donut.selectors.segment]: componentToString(
                  chartConfig,
                  ChartTooltipContent,
                  { hideLabel: true },
                )!,
              }"
            />
          </VisSingleContainer>
        </ChartContainer>

        <!-- Legend -->

        <div class="mx-auto flex w-full max-w-xs min-w-0 flex-col gap-4 px-4">
          <div
            v-for="region in chartData"
            :key="region.key"
            class="flex items-center gap-3"
          >
            <div
              class="size-3 shrink-0 rounded-xs"
              :style="{
                backgroundColor: chartConfig[region.key]?.color,
              }"
            />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                {{ region.regionName }}
              </p>

              <p class="text-xs text-muted-foreground tabular-nums">
                {{ numberFormatter.format(region.count) }} thí sinh
              </p>
            </div>

            <span class="shrink-0 text-base font-semibold tabular-nums">
              {{ formatPercentage(region.percentage) }}
            </span>
          </div>

          <!-- Total candidates -->

          <div class="border-t pt-3">
            <p class="text-sm text-muted-foreground">Tổng số thí sinh</p>

            <p class="text-2xl font-semibold tabular-nums">
              {{ numberFormatter.format(total) }}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
