<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart";

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

import { ageGroupData } from "@/mocks/dashboardCharts";

type Data = (typeof ageGroupData)[number];

const chartConfig = {
  count: {
    label: "Số thí sinh",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const ageTicks = ageGroupData.map((_, index) => index);

// Format X-axis labels.
function formatAgeGroup(value: number): string {
  return ageGroupData[Math.round(value)]?.ageGroup ?? "";
}

// Format Y-axis values.
function formatCount(value: number): string {
  return Math.round(value).toLocaleString("vi-VN");
}
</script>

<template>
  <Card class="flex h-full min-w-0 w-full flex-col">
    <CardHeader>
      <CardTitle>Phân bổ theo nhóm tuổi</CardTitle>

      <CardDescription>
        Số lượng thí sinh đăng ký theo nhóm tuổi
      </CardDescription>
    </CardHeader>

    <CardContent class="flex min-w-0 flex-1 items-center">
      <ChartContainer
        :config="chartConfig"
        class="aspect-auto h-64 w-full min-w-0"
      >
        <VisXYContainer :data="ageGroupData" :y-domain="[0, undefined]">
          <VisGroupedBar
            :x="(_d: Data, i: number) => i"
            :y="(d: Data) => d.count"
            :color="chartConfig.count.color"
            :rounded-corners="4"
            :bar-padding="0.2"
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
