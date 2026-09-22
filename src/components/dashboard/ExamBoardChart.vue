<script setup lang="ts">
import { computed } from "vue";

import type { ChartConfig } from "@/components/ui/chart";
import type { DashboardEducationLevel } from "@/types/dashboard-api";

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
  educationLevels: DashboardEducationLevel[];
}>();

// Chart data

const chartData = computed(() =>
  props.educationLevels
    .filter((item) => item.count > 0)
    .map((item, index) => ({
      ...item,
      key: `board${index}`,
      fill: `var(--color-board${index})`,
    })),
);

type Data = (typeof chartData.value)[number];

// Chart configuration

function getBoardLabel(item: DashboardEducationLevel): string {
  if (item.code === "TABLE_A") return "Bảng A";
  if (item.code === "TABLE_B") return "Bảng B";

  return item.name;
}

const chartConfig = computed<ChartConfig>(() => {
  const config: ChartConfig = {
    count: {
      label: "Số thí sinh",
      color: undefined,
    },
  };

  chartData.value.forEach((item, index) => {
    config[item.key] = {
      label: getBoardLabel(item),
      color: `var(--chart-${(index % 5) + 1})`,
    };
  });

  return config;
});

// Summary

const total = computed(() =>
  chartData.value.reduce((sum, item) => sum + item.count, 0),
);

// Formatters

const numberFormatter = new Intl.NumberFormat("vi-VN");

const percentageFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
});

function getPercentage(count: number): string {
  if (total.value === 0) return "0%";

  return `${percentageFormatter.format((count / total.value) * 100)}%`;
}

// Tooltip

const tooltipTriggers = computed(() => ({
  [Donut.selectors.segment]: componentToString(
    chartConfig.value,
    ChartTooltipContent,
    { hideLabel: true },
  )!,
}));
</script>

<template>
  <Card class="flex min-w-0 flex-col gap-4">
    <!-- Chart header -->

    <CardHeader>
      <CardTitle>Phân bố theo bảng thi</CardTitle>

      <CardDescription>
        Số lượng và tỷ trọng thí sinh theo bảng thi
      </CardDescription>
    </CardHeader>

    <!-- Chart content -->

    <CardContent class="min-w-0">
      <!-- Empty state -->

      <div
        v-if="total === 0"
        class="flex h-64 items-center justify-center text-sm text-muted-foreground"
      >
        Không có dữ liệu bảng thi trong khoảng thời gian này.
      </div>

      <!-- Pie chart and legend -->

      <div
        v-else
        class="grid min-w-0 grid-cols-1 items-center gap-6 md:grid-cols-2"
      >
        <!-- Pie chart -->

        <ChartContainer
          :config="chartConfig"
          class="mx-auto aspect-square size-64 min-w-0"
        >
          <VisSingleContainer
            :data="chartData"
            :margin="{ top: 20, bottom: 20 }"
          >
            <VisDonut
              :value="(d: Data) => d.count"
              :color="(d: Data) => d.fill"
              :arc-width="0"
              :pad-angle="0"
              :corner-radius="0"
            />

            <ChartTooltip :triggers="tooltipTriggers" />
          </VisSingleContainer>
        </ChartContainer>

        <!-- Legend -->

        <div class="mx-auto flex w-full max-w-xs min-w-0 flex-col gap-4 px-4">
          <div
            v-for="item in chartData"
            :key="item.key"
            class="flex items-center gap-3"
          >
            <div
              class="size-3 shrink-0 rounded-xs"
              :style="{
                backgroundColor: chartConfig[item.key]?.color,
              }"
            />

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                {{ getBoardLabel(item) }}
              </p>

              <p class="text-xs text-muted-foreground tabular-nums">
                {{ numberFormatter.format(item.count) }} thí sinh
              </p>
            </div>

            <!-- Board percentage -->

            <span class="shrink-0 text-base font-semibold tabular-nums">
              {{ getPercentage(item.count) }}
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
