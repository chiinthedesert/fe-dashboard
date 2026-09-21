<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { Sun, Moon } from "lucide-vue-next";

import { Button } from "@/components/ui/button";

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :aria-label="isDark ? 'Chế độ sáng' : 'Chế độ tối'"
    @click="toggleDark()"
  >
    <Sun v-if="isDark" class="size-5" />
    <Moon v-else class="size-5" />
  </Button>
</template>
