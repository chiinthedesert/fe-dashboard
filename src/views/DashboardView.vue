<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";

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
  <div class="flex flex-col gap-4">
    <Tabs v-model="activeTab" class="min-w-0 max-w-full">
      <div class="overflow-x-auto">
        <TabsList class="w-max">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.routeName"
            :value="tab.routeName"
            class="shrink-0 whitespace-nowrap"
          >
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>

    <RouterView />
  </div>
</template>
