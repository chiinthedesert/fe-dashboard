<script setup lang="ts">
import { watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useDark } from "@vueuse/core";

import { useAuth } from "@/composables/useAuth";

// Theme

useDark({
  initialValue: "dark",
  storageKey: "dashboard-theme",
});

// Authentication

const router = useRouter();
const { isLoggedIn } = useAuth();

watch(isLoggedIn, (loggedIn) => {
  if (!loggedIn && router.currentRoute.value.meta.requiresAuth) {
    router.replace({ name: "login" });
  }
});
</script>

<template>
  <RouterView />
</template>
