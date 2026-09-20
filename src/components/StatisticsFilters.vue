<script setup lang="ts">
const search = defineModel<string>("search", { default: "" })

defineProps<{
  searchPlaceholder?: string
}>()

const emits = defineEmits<{
  clear: []
}>()
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end">
    <label class="min-w-0 flex-1 space-y-1">
      <span class="text-sm font-medium">Tìm kiếm</span>
      <input
        v-model="search"
        type="search"
        :placeholder="searchPlaceholder ?? 'Nhập từ khóa...'"
        class="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </label>

    <slot />

    <button
      type="button"
      class="h-9 shrink-0 rounded-md border px-3 text-sm font-medium hover:bg-accent"
      @click="emits('clear')"
    >
      Xóa bộ lọc
    </button>
  </div>
</template>