<script setup lang="ts">
import { computed } from "vue"

export interface StatisticsColumn {
  key: string
  label: string
  align?: "left" | "center" | "right"
}

const props = withDefaults(defineProps<{
  columns: StatisticsColumn[]
  rows: Record<string, string | number>[]
  emptyMessage?: string
}>(), {
  emptyMessage: "Chưa có dữ liệu phù hợp",
})

const columnClass = (align: StatisticsColumn["align"] = "left") => ({
  "text-left": align === "left",
  "text-center": align === "center",
  "text-right": align === "right",
})

const hasRows = computed(() => props.rows.length > 0)
</script>

<template>
  <div class="overflow-hidden rounded-lg border bg-card">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[640px] text-sm">
        <thead class="border-b bg-muted/40">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-4 py-3 font-medium text-muted-foreground"
              :class="columnClass(column.align)"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody v-if="hasRows" class="divide-y">
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="hover:bg-muted/30">
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3"
              :class="columnClass(column.align)"
            >
              {{ row[column.key] ?? "-" }}
            </td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr>
            <td :colspan="columns.length" class="px-4 py-10 text-center text-muted-foreground">
              {{ emptyMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>