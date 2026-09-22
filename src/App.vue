<script setup lang="ts">
import { watch } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

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
