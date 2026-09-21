<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart";

import { VisDonut, VisSingleContainer } from "@unovis/vue";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChartContainer } from "@/components/ui/chart";

import { examBoardData } from "@/mocks/dashboardCharts";

type Data = (typeof examBoardData)[number];

const chartConfig = {
  boardA: {
    label: "Bảng A",
    color: "var(--chart-1)",
  },
  boardB: {
    label: "Bảng B",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const total = examBoardData.reduce((sum, item) => sum + item.count, 0);

function getPercentage(count: number): string {
  if (total === 0) return "0%";

  return `${((count / total) * 100).toFixed(1)}%`;
}

function getBoardColor(board: string): string {
  return board === "Bảng A"
    ? chartConfig.boardA.color
    : chartConfig.boardB.color;
}
</script>

<template>
  <Card class="flex h-full min-w-0 w-full flex-col">
    <CardHeader>
      <CardTitle>Phân bổ theo bảng thi</CardTitle>

      <CardDescription> Tỷ trọng đăng ký Bảng A / Bảng B </CardDescription>
    </CardHeader>

    <CardContent
      class="flex min-w-0 flex-1 flex-col items-center justify-center gap-4"
    >
      <ChartContainer
        :config="chartConfig"
        class="aspect-auto h-64 w-full min-w-0"
      >
        <VisSingleContainer :data="examBoardData">
          <VisDonut
            :value="(d: Data) => d.count"
            :color="(d: Data) => getBoardColor(d.board)"
            :arc-width="50"
            :pad-angle="0"
            :corner-radius="0"
          />
        </VisSingleContainer>
      </ChartContainer>

      <!-- Legend -->
      <div
        class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
      >
        <div
          v-for="item in examBoardData"
          :key="item.board"
          class="flex items-center gap-2"
        >
          <span
            class="size-2.5 shrink-0 rounded-sm"
            :style="{
              backgroundColor: getBoardColor(item.board),
            }"
          />

          <span class="text-muted-foreground">
            {{ item.board }}
          </span>

          <span class="font-medium tabular-nums">
            {{ getPercentage(item.count) }}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
