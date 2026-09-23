<script setup lang="ts">
import type { DashboardRegion } from "@/types/dashboard-api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

// Props

defineProps<{
  regions: DashboardRegion[];
}>();

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
  <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
    <!-- Empty state -->

    <Card v-if="regions.length === 0" class="md:col-span-3">
      <CardContent class="text-sm text-muted-foreground">
        Không có dữ liệu khu vực trong khoảng thời gian này.
      </CardContent>
    </Card>

    <!-- Regional cards -->

    <Card
      v-for="region in regions"
      :key="region.regionName"
      class="min-w-0 gap-4"
    >
      <CardHeader>
        <CardTitle>
          {{ region.regionName }}
        </CardTitle>
      </CardHeader>

      <CardContent class="space-y-3">
        <!-- Candidate count -->

        <div class="space-y-1">
          <p class="text-3xl font-semibold tabular-nums">
            {{ numberFormatter.format(region.count) }}
          </p>

          <p class="text-sm text-muted-foreground">Số thí sinh</p>
        </div>

        <!-- Regional percentage -->

        <Progress
          :model-value="Math.min(100, Math.max(0, region.percentage))"
          :aria-label="`Tỷ trọng ${region.regionName}`"
          class="h-2"
        />

        <p class="text-sm font-medium text-muted-foreground">
          {{ formatPercentage(region.percentage) }}
          tổng số thí sinh
        </p>
      </CardContent>
    </Card>
  </div>
</template>
