<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { Download } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const route = useRoute();
const router = useRouter();

const tabs = [
  {
    label: "Tổng quan",
    routeName: "dashboard-overview",
  },
  {
    label: "Theo khu vực",
    routeName: "dashboard-regions",
  },
  {
    label: "Bảng thi & Độ tuổi",
    routeName: "dashboard-demographics",
  },
  {
    label: "Trường học",
    routeName: "dashboard-schools",
  },
];

const activeTab = computed({
  get: () => String(route.name ?? "dashboard-overview"),

  set: (routeName: string) => {
    if (routeName !== route.name) {
      router.push({ name: routeName });
    }
  },
});
</script>
<template>
  <div class="flex min-w-0 flex-col gap-4">
    <Tabs v-model="activeTab" class="min-w-0 max-w-full">
      <div class="overflow-x-auto">
        <TabsList class="w-max">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.routeName"
            :value="tab.routeName"
            class="shrink-0 whitespace-nowrap transition-colors hover:bg-foreground/10 data-[state=active]:hover:bg-background"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>

    <RouterView />

    <!-- Stays visible while scrolling; occupies space at the bottom -->
    <div class="pointer-events-none sticky bottom-4 z-20 flex justify-end">
      <Button type="button" class="pointer-events-auto gap-2 shadow-lg">
        <Download class="size-4 shrink-0" />
        Xuất báo cáo
      </Button>
    </div>
  </div>
</template>
