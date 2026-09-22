<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import ThemeToggle from "@/components/shared/ThemeToggle.vue";
import { useIdleLogout } from "@/composables/useIdleLogout";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const route = useRoute();
useIdleLogout();

const pageTitle = computed(() =>
  String(route.meta.title ?? "Dashboard Vận hành"),
);

const pageDescription = computed(() =>
  String(
    route.meta.description ??
      "Theo dõi đăng ký, thanh toán và tiến độ vận hành cuộc thi Python Master",
  ),
);
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="min-w-0">
      <header
        class="flex min-h-16 shrink-0 items-center gap-3 border-b px-4 py-2"
      >
        <SidebarTrigger class="-ml-1 shrink-0" />

        <div class="min-w-0">
          <h1 class="truncate text-lg font-semibold leading-tight">
            {{ pageTitle }}
          </h1>

          <p class="truncate text-sm text-muted-foreground">
            {{ pageDescription }}
          </p>
        </div>
        <div class="ml-auto shrink-0">
          <ThemeToggle />
        </div>
      </header>

      <main class="flex flex-1 flex-col gap-4 p-4">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
