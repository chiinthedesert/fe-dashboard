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
    <!-- Tabs and export button -->
    <div class="flex min-w-0 items-center justify-between gap-4">
      <Tabs v-model="activeTab" class="min-w-0 flex-1">
        <div class="overflow-x-auto">
          <TabsList class="w-max gap-2">
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

      <!-- Export button -->
      <Button type="button" class="shrink-0 gap-2">
        <Download class="size-4 shrink-0" />
        <span class="hidden sm:inline">Xuất báo cáo</span>
      </Button>
    </div>

    <RouterView />
  </div>
</template>
