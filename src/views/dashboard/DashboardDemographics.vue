<script setup lang="ts">
import ExamBoardChart from "@/components/dashboard/ExamBoardChart.vue";
import AgeGroupChart from "@/components/dashboard/AgeGroupChart.vue";
</script>

<template>
  <section
    class="grid min-w-0 grid-cols-1 items-stretch gap-4 min-[68rem]:grid-cols-[2fr_3fr]"
  >
    <ExamBoardChart />
    <AgeGroupChart />
  </section>
</template>
