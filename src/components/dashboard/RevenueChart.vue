<script setup lang="ts">
import { computed } from "vue";

import type { ChartConfig } from "@/components/ui/chart";
import type { DashboardRevenueResponse } from "@/types/dashboard-api";

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

// Props

const props = defineProps<{
  data: DashboardRevenueResponse | null;
  loading: boolean;
  error: string;
}>();

// Chart data

const chartData = computed(() =>
  (props.data?.chi_tiet_theo_bang ?? []).map((item) => ({
    name: item.name,
    revenue: item.doanh_thu,
  })),
);

type Data = (typeof chartData.value)[number];

// Chart configuration

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

// X-axis positions

const ticks = computed(() => chartData.value.map((_, index) => index));

// Keep bars away from chart edges.

const xDomain = computed<[number, number]>(() => [
  -1,
  Math.max(1, chartData.value.length),
]);

// Formatters

const numberFormatter = new Intl.NumberFormat("vi-VN");

function formatBoard(value: number): string {
  return chartData.value[Math.round(value)]?.name ?? "";
}

function formatRevenue(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} tr`;
  }

  return numberFormatter.format(Math.round(value));
}
</script>

<template>
  <Card class="min-w-0 w-full">
    <!-- Header -->

    <CardHeader>
      <CardTitle> Doanh thu theo bảng thi </CardTitle>

      <CardDescription>
        Phân bổ doanh thu trong khoảng thời gian đã chọn
      </CardDescription>

      <p v-if="data" class="text-xs text-muted-foreground">
        Tổng doanh thu:

        <span class="font-medium text-foreground tabular-nums">
          {{ numberFormatter.format(data.tong_doanh_thu) }}
          VNĐ
        </span>
      </p>
    </CardHeader>

    <!-- Content -->

    <CardContent class="min-w-0">
      <!-- Loading -->

      <div
        v-if="loading"
        class="flex h-64 items-center justify-center text-sm text-muted-foreground"
      >
        Đang tải dữ liệu doanh thu...
      </div>

      <!-- Error -->

      <p
        v-else-if="error"
        role="alert"
        class="flex h-64 items-center justify-center text-center text-sm text-destructive"
      >
        {{ error }}
      </p>

      <!-- Empty -->

      <div
        v-else-if="chartData.length === 0"
        class="flex h-64 items-center justify-center text-sm text-muted-foreground"
      >
        Không có dữ liệu doanh thu trong khoảng thời gian này.
      </div>

      <!-- Chart -->

      <ChartContainer
        v-else
        :config="chartConfig"
        class="aspect-auto h-64 w-full min-w-0"
      >
        <VisXYContainer
          :data="chartData"
          :x-domain="xDomain"
          :y-domain="[0, undefined]"
        >
          <!-- Bars -->

          <VisGroupedBar
            :x="(_: Data, index: number) => index"
            :y="(d: Data) => d.revenue"
            :color="chartConfig.revenue.color"
            :rounded-corners="4"
            :bar-padding="0.3"
            :group-padding="0"
          />

          <!-- X axis -->

          <VisAxis
            type="x"
            :tick-values="ticks"
            :tick-format="formatBoard"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />

          <!-- Y axis -->

          <VisAxis
            type="y"
            :num-ticks="4"
            :tick-format="formatRevenue"
            :tick-line="false"
            :domain-line="false"
            :grid-line="true"
          />

          <!-- Tooltip -->

          <ChartTooltip />

          <ChartCrosshair
            :template="
              componentToString(chartConfig, ChartTooltipContent, {
                hideLabel: true,
                hideIndicator: true,

                itemLayout: 'stacked',

                valueFormatter: (value) =>
                  `${Number(value).toLocaleString('vi-VN')} VNĐ`,
              })
            "
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
