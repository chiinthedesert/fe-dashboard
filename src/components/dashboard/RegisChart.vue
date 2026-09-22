<script setup lang="ts">
import { computed } from "vue";

import type { ChartConfig } from "@/components/ui/chart";

import type { RegistrationTrendResponse } from "@/types/dashboard-api";

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
  data: RegistrationTrendResponse | null;
  loading: boolean;
  error: string;
}>();

// Date utilities

function parseDate(value: string): number {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (iso) {
    const [, year, month, day] = iso;

    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  const vietnamese = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (vietnamese) {
    const [, day, month, year] = vietnamese;

    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  const shortDate = value.match(/^(\d{2})\/(\d{2})$/);

  if (shortDate) {
    const [, day, month] = shortDate;

    const year = new Date().getFullYear();

    return Date.UTC(year, Number(month) - 1, Number(day));
  }

  return NaN;
}

function formatDate(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

// Chart data

interface Data {
  date: number;
  registrations: number;
}

const chartData = computed<Data[]>(() => {
  return (props.data?.data ?? [])
    .map((item) => ({
      date: parseDate(item.date),
      registrations: item.registrationCount,
    }))
    .filter(
      (item) =>
        Number.isFinite(item.date) && Number.isFinite(item.registrations),
    )
    .sort((a, b) => a.date - b.date);
});

// Chart configuration

const chartConfig = {
  registrations: {
    label: "Số lượng",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const dateTicks = computed(() => chartData.value.map((item) => item.date));
</script>

<template>
  <Card class="min-w-0 w-full">
    <!-- Card header -->

    <CardHeader>
      <CardTitle> Xu hướng đăng ký theo ngày </CardTitle>

      <CardDescription>
        Số lượt đăng ký mới trong khoảng thời gian đã chọn
      </CardDescription>
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
        class="flex h-64 items-center justify-center text-center text-sm text-muted-foreground"
      >
        Không có dữ liệu đăng ký trong khoảng thời gian này.
      </div>

      <ChartContainer
        v-else
        :config="chartConfig"
        class="aspect-auto h-64 w-full min-w-0"
      >
        <VisXYContainer :data="chartData" :y-domain="[0, undefined]">
          <!-- Registration bars -->

          <VisGroupedBar
            :x="(d: Data) => d.date"
            :y="(d: Data) => d.registrations"
            :color="chartConfig.registrations.color"
            :rounded-corners="4"
            :bar-padding="0.1"
            :group-padding="0"
          />

          <!-- X axis -->

          <VisAxis
            type="x"
            :x="(d: Data) => d.date"
            :tick-format="formatDate"
            :tick-values="dateTicks"
            :tick-text-adaptive-sets="true"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />

          <!-- Y axis -->

          <VisAxis
            type="y"
            :num-ticks="4"
            :tick-line="false"
            :domain-line="false"
            :grid-line="true"
          />

          <!-- Tooltip -->

          <ChartTooltip />

          <ChartCrosshair
            :template="
              componentToString(chartConfig, ChartTooltipContent, {
                labelFormatter: (value) => formatDate(Number(value)),
              })
            "
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</template>
