<script setup lang="ts">
import { ref } from "vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-vue-next";

const filtersOpen = ref(false);

const region = ref("all");
const competition = ref("all");
const period = ref("30d");
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-xl border bg-card p-2 sm:flex-row sm:items-start sm:p-4"
  >
    <Button
      type="button"
      variant="ghost"
      class="w-full justify-between px-2 sm:hidden"
      :aria-expanded="filtersOpen"
      aria-controls="dashboard-filters"
      @click="filtersOpen = !filtersOpen"
    >
      Bộ lọc
      <ChevronDown
        class="size-4 transition-transform"
        :class="{ 'rotate-180': filtersOpen }"
      />
    </Button>

    <span
      class="hidden shrink-0 text-sm font-medium text-muted-foreground sm:block sm:pt-2"
    >
      Bộ lọc
    </span>

    <div
      id="dashboard-filters"
      class="w-full min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid sm:w-auto sm:grid-cols-[repeat(2,12rem)] lg:grid-cols-[repeat(3,12rem)]"
      :class="filtersOpen ? 'grid' : 'hidden'"
    >
      <Select v-model="region">
        <SelectTrigger class="w-full" aria-label="Khu vực">
          <SelectValue placeholder="Chọn khu vực" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Toàn quốc</SelectItem>
          <SelectItem value="north">Miền Bắc</SelectItem>
          <SelectItem value="central">Miền Trung</SelectItem>
          <SelectItem value="south">Miền Nam</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="competition">
        <SelectTrigger class="w-full" aria-label="Bảng thi">
          <SelectValue placeholder="Chọn bảng thi" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Tất cả bảng thi</SelectItem>
          <SelectItem value="A">Bảng A</SelectItem>
          <SelectItem value="B">Bảng B</SelectItem>
        </SelectContent>
      </Select>

      <Select v-model="period">
        <SelectTrigger class="w-full" aria-label="Khoảng thời gian">
          <SelectValue placeholder="Chọn thời gian" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="30d">30 ngày qua</SelectItem>
          <SelectItem value="7d">7 ngày qua</SelectItem>
          <SelectItem value="all">Từ đầu chương trình</SelectItem>
          <SelectItem value="custom" disabled>Tuỳ chỉnh</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
