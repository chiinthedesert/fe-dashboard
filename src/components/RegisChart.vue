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
import { registrationChartData } from "@/mocks/dashboardCharts";

type Data = (typeof registrationChartData)[number];

const chartConfig = {
  registrations: {
    label: "Số lượng",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const dateTicks = registrationChartData.map((item) => new Date(item.date));

// Format dates as DD/MM
function formatDate(value: number): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}
</script>

<template>
  <Card class="min-w-0 w-full">
    <CardHeader>
      <CardTitle>Xu hướng đăng ký theo ngày</CardTitle>

      <CardDescription>
        Số lượt đăng ký mới trong khoảng thời gian đã chọn
      </CardDescription>
    </CardHeader>
    <CardContent class="min-w-0">
      <ChartContainer
        :config="chartConfig"
        class="aspect-auto h-64 w-full min-w-0"
      >
        <VisXYContainer
          :data="registrationChartData"
          :y-domain="[0, undefined]"
        >
          <VisGroupedBar
            :x="(d: Data) => new Date(d.date)"
            :y="(d: Data) => d.registrations"
            :color="chartConfig.registrations.color"
            :rounded-corners="4"
            :bar-padding="0.1"
            :group-padding="0"
          />

          <VisAxis
            type="x"
            :x="(d: Data) => new Date(d.date)"
            :tick-format="formatDate"
            :tick-values="dateTicks"
            :tick-text-adaptive-sets="true"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
          />

          <VisAxis
            type="y"
            :num-ticks="4"
            :tick-line="false"
            :domain-line="false"
            :grid-line="true"
          />
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
