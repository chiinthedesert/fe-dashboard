<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const props = withDefaults(
  defineProps<{
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
    itemLabel?: string;
    pageSizes?: number[];
  }>(),
  {
    itemLabel: "bản ghi",
    pageSizes: () => [10, 20, 50],
  },
);

const emit = defineEmits<{
  "update:page": [page: number];
  "update:pageSize": [size: number];
}>();

const totalPages = computed(() => Math.max(1, props.pageCount));
const pageInput = ref<string | number>(props.page);

watch(
  () => props.page,
  (page) => {
    pageInput.value = page;
  },
);

function goToPage() {
  const value = Number(pageInput.value);

  if (String(pageInput.value).trim() === "" || !Number.isFinite(value)) {
    pageInput.value = props.page;
    return;
  }

  const page = Math.min(totalPages.value, Math.max(1, Math.trunc(value)));

  pageInput.value = page;
  emit("update:page", page);
}

function changePage(page: number) {
  pageInput.value = page;
  emit("update:page", page);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground">{{ total }} {{ itemLabel }}</p>

      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Số dòng</span>

        <div
          role="group"
          aria-label="Số dòng mỗi trang"
          class="inline-flex overflow-hidden rounded-md border"
        >
          <Button
            v-for="size in pageSizes"
            :key="size"
            type="button"
            variant="ghost"
            size="sm"
            class="rounded-none border-r px-3 last:border-r-0"
            :class="{
              'bg-accent text-accent-foreground': pageSize === size,
            }"
            :aria-pressed="pageSize === size"
            @click="emit('update:pageSize', size)"
          >
            {{ size }}
          </Button>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Trang</span>

        <Input
          v-model="pageInput"
          type="number"
          inputmode="numeric"
          :min="1"
          :max="totalPages"
          :step="1"
          :disabled="total === 0"
          aria-label="Trang hiện tại"
          class="h-6 w-10 px-1 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          @keydown.enter.prevent="goToPage"
          @blur="goToPage"
        />

        <span>/ {{ totalPages }}</span>
      </div>

      <div class="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="page <= 1"
          @click="changePage(page - 1)"
        >
          Trước
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          :disabled="page >= totalPages"
          @click="changePage(page + 1)"
        >
          Sau
        </Button>
      </div>
    </div>
  </div>
</template>
