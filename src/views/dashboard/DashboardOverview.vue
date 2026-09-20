<script setup lang="ts">
import Filter from "@/components/ui/filter/Filter.vue";
import OverviewCards from "@/components/OverviewCards.vue";
import RegisChart from "@/components/RegisChart.vue";
import ConversionChart from "@/components/ConversionChart.vue";
</script>
<template>
  <section>
    <Filter />
  </section>
  <section>
    <OverviewCards />
  </section>

  <section
    class="grid min-w-0 grid-cols-1 gap-4 min-[68rem]:grid-cols-[2fr_1fr]"
  >
    <RegisChart />
    <ConversionChart />
  </section>
</template>
