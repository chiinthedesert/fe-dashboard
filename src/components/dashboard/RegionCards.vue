<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { regionData } from "@/mocks/dashboardCharts";

const regions = ["Miền Bắc", "Miền Trung", "Miền Nam"];

const summaryData = regions.map((region) => {
  const cities = regionData.filter((item) => item.region === region);

  const registrations = cities.reduce(
    (sum, item) => sum + item.registrations,
    0,
  );

  const target = cities.reduce((sum, item) => sum + item.target, 0);

  const progress = target > 0 ? Math.round((registrations / target) * 100) : 0;

  return {
    region,
    registrations,
    target,
    progress,
  };
});
</script>

<template>
  <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
    <Card v-for="item in summaryData" :key="item.region" class="">
      <CardHeader class="">
        <CardTitle>{{ item.region }}</CardTitle>
      </CardHeader>

      <CardContent class="space-y-3">
        <p class="text-sm text-muted-foreground">
          {{ item.registrations }} / {{ item.target }} chỉ tiêu
        </p>

        <Progress :model-value="Math.min(item.progress, 100)" class="h-2" />

        <p class="text-sm font-medium text-muted-foreground">
          {{ item.progress }}% hoàn thành
        </p>
      </CardContent>
    </Card>
  </div>
</template>
