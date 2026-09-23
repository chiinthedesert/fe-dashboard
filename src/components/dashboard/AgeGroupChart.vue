<script setup lang="ts">
import { computed } from "vue";

import type { ChartConfig } from "@/components/ui/chart";
import type { DashboardAgeGroups } from "@/types/dashboard-api";

import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from "@/components/ui/chart";

// API data and request state

const props = defineProps<{
  ageGroups: DashboardAgeGroups | null;
  loading: boolean;
  error: string;
}>();

// Age group labels

const ageGroupLabels: Record<string, string> = {
  under15: "Dưới 15",
  "15to17": "15–17",
  "18to20": "18–20",
  over20: "Trên 20",
};

// Chart data

const chartData = computed(() =>
  Object.entries(props.ageGroups ?? {}).map(([ageGroup, count]) => ({
    ageGroup,
    label: ageGroupLabels[ageGroup] ?? ageGroup,
    count,
  })),
);

type Data = (typeof chartData.value)[number];

// X-axis positions

const ageTicks = computed(() => chartData.value.map((_, index) => index));

// Chart configuration

const chartConfig = {
  count: {
    label: "Số thí sinh",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Formatters

function formatAgeGroup(value: number): string {
  return chartData.value[Math.round(value)]?.label ?? "";
}

function formatCount(value: number): string {
  return Math.round(value).toLocaleString("vi-VN");
}
</script>

<template>
  <Card class="flex h-full min-w-0 w-full flex-col">
    <!-- Chart header -->

    <CardHeader>
      <CardTitle> Phân bố theo nhóm tuổi </CardTitle>

      <CardDescription> Số lượng thí sinh theo từng nhóm tuổi </CardDescription>

      <p class="text-xs text-muted-foreground">
        Toàn bộ chương trình · Không áp dụng bộ lọc thời gian
      </p>
    </CardHeader>

    <!-- Chart content -->

    <CardContent class="flex min-w-0 flex-1 items-center">
      <!-- Loading state -->

      <div
        v-if="loading"
        class="flex h-64 w-full items-center justify-center text-sm text-muted-foreground"
      >
        Đang tải dữ liệu độ tuổi...
      </div>

      <!-- Error state -->

      <p
        v-else-if="error"
        role="alert"
        class="flex h-64 w-full items-center justify-center text-center text-sm text-destructive"
      >
        {{ error }}
      </p>

      <!-- Empty state -->

      <div
        v-else-if="chartData.length === 0"
        class="flex h-64 w-full items-center justify-center text-sm text-muted-foreground"
      >
        Không có dữ liệu độ tuổi.
      </div>

      <!-- Age group chart -->

      <ChartContainer
        v-else
        :config="chartConfig"
        class="aspect-auto h-64 w-full min-w-0"
      >
        <VisXYContainer :data="chartData" :y-domain="[0, undefined]">
          <!-- Bars -->

          <VisGroupedBar
            :x="(_: Data, index: number) => index"
            :y="(d: Data) => d.count"
            :color="chartConfig.count.color"
            :rounded-corners="4"
            :bar-padding="0.1"
            :group-padding="0"
          />

          <!-- X axis -->

          <VisAxis
            type="x"
            :tick-values="ageTicks"
            :tick-format="formatAgeGroup"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />

          <!-- Y axis -->

          <VisAxis
            type="y"
            :num-ticks="4"
            :tick-format="formatCount"
            :tick-line="false"
            :domain-line="false"
            :grid-line="true"
          />

          <!-- Tooltip -->

          <ChartTooltip />

          <ChartCrosshair
            :template="
              componentToString(chartConfig, ChartTooltipContent, {
                labelFormatter: (value) => formatAgeGroup(Number(value)),
              })
            "
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
