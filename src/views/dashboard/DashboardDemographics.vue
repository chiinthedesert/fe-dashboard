<script setup lang="ts">
import { computed, ref } from "vue";

/* =========================================================
   DỮ LIỆU BẢNG THI
   Mock data hiện tại.
   Sau này API có thể gán vào examData.value
   ========================================================= */

const examData = ref([
  {
    name: "Bảng A",
    count: 4820,
  },
  {
    name: "Bảng B",
    count: 6150,
  },
  {
    name: "Bảng C",
    count: 4872,
  },
]);

const examColors = [
  "#7C5CFC",
  "#22D3EE",
  "#34D399",
  "#FB7185",
  "#FBBF24",
];

/* =========================================================
   DỮ LIỆU ĐỘ TUỔI
   ========================================================= */

const ageData = ref([
  {
    label: "Dưới 15",
    value: 2900,
  },
  {
    label: "15 - 17",
    value: 6150,
  },
  {
    label: "18 - 20",
    value: 3800,
  },
  {
    label: "Trên 20",
    value: 1800,
  },
]);

/* =========================================================
   TỔNG SỐ THÍ SINH
   ========================================================= */

const totalCandidates = computed(() => {
  return examData.value.reduce(
    (total, item) => total + item.count,
    0,
  );
});

/* =========================================================
   DONUT CHART - BẢNG THI
   ========================================================= */

const circumference = 2 * Math.PI * 76;

const donutData = computed(() => {
  let offset = 0;

  return examData.value.map((item, index) => {
    const percentage =
      totalCandidates.value > 0
        ? item.count / totalCandidates.value
        : 0;

    const length = percentage * circumference;

    const color =
      examColors[index % examColors.length];

    const result = {
      ...item,
      color,
      length,
      offset,
    };

    offset += length;

    return result;
  });
});

/* =========================================================
   PHẦN TRĂM BẢNG THI
   ========================================================= */

function getPercentage(count: number) {
  if (totalCandidates.value === 0) {
    return "0";
  }

  return (
    (count / totalCandidates.value) * 100
  ).toFixed(1);
}

/* =========================================================
   BIỂU ĐỒ ĐỘ TUỔI
   ========================================================= */

const maxAgeValue = computed(() => {
  if (ageData.value.length === 0) {
    return 0;
  }

  return Math.max(
    ...ageData.value.map((item) => item.value),
  );
});

/* =========================================================
   MỐC TRỤC Y
   ========================================================= */

const ageChartMax = computed(() => {
  const max = maxAgeValue.value;

  if (max === 0) {
    return 0;
  }

  return Math.ceil(max / 1000) * 1000;
});

const ageChartTicks = computed(() => {
  const max = ageChartMax.value;

  if (max === 0) {
    return [0, 0, 0, 0, 0];
  }

  return [
    max,
    max * 0.75,
    max * 0.5,
    max * 0.25,
    0,
  ];
});

/* =========================================================
   CHIỀU CAO CỘT
   ========================================================= */

function getBarHeight(value: number) {
  if (ageChartMax.value === 0) {
    return "0%";
  }

  return `${(value / ageChartMax.value) * 100}%`;
}

/* =========================================================
   FORMAT TRỤC Y
   ========================================================= */

function formatAgeTick(value: number) {
  return value.toLocaleString("vi-VN");
}
</script>

<template>
  <div
    class="grid min-w-0 grid-cols-1 gap-[18px] xl:grid-cols-[40fr_60fr]"
  >
    <!-- =====================================================
         BẢNG THI
         ===================================================== -->

    <div
      class="min-w-0 rounded-2xl border border-[#232838] bg-[#141824] p-6"
    >
      <!-- Header -->

      <div class="mb-[18px]">
        <h3
          class="text-[16px] font-semibold leading-6 text-[#F8FAFC]"
        >
          Phân bố theo bảng thi
        </h3>

        <p
          class="mt-1 text-[13px] font-normal leading-[18px] text-[#8B93A7]"
        >
          Số lượng thí sinh theo từng bảng thi
        </p>
      </div>

      <!-- Content -->

      <div
        class="flex h-auto flex-col items-center gap-6 lg:h-[280px] lg:flex-row lg:gap-10"
      >
        <!-- Donut -->

        <div
          class="relative h-[210px] w-[210px] shrink-0 lg:h-[250px] lg:w-[250px]"
        >
          <svg
            class="h-full w-full -rotate-90"
            viewBox="0 0 220 220"
          >
            <!-- Background -->

            <circle
              cx="110"
              cy="110"
              r="76"
              fill="none"
              stroke="#232838"
              stroke-width="32"
            />

            <!-- Segments -->

            <circle
              v-for="item in donutData"
              :key="item.name"
              cx="110"
              cy="110"
              r="76"
              fill="none"
              :stroke="item.color"
              stroke-width="32"
              stroke-linecap="butt"
              :stroke-dasharray="`${item.length} ${circumference}`"
              :stroke-dashoffset="-item.offset"
            />
          </svg>

          <!-- Center -->

          <div
            class="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span
              class="text-[12px] leading-4 text-[#8B93A7]"
            >
              Tổng cộng
            </span>

            <strong
              class="mt-1 text-[22px] font-semibold leading-7 text-[#F8FAFC]"
            >
              {{
                totalCandidates.toLocaleString("vi-VN")
              }}
            </strong>
          </div>
        </div>

        <!-- Legend -->

        <div
          class="flex min-w-0 w-full flex-1 flex-col gap-[18px] lg:w-auto"
        >
          <div
            v-for="item in donutData"
            :key="item.name"
            class="flex flex-col"
          >
            <div
              class="flex items-center justify-between gap-3"
            >
              <div
                class="flex min-w-0 items-center gap-2"
              >
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :style="{
                    backgroundColor: item.color,
                  }"
                ></span>

                <span
                  class="truncate text-[13px] font-medium leading-[18px] text-[#F8FAFC]"
                >
                  {{ item.name }}
                </span>
              </div>

              <strong
                class="shrink-0 text-[13px] font-semibold leading-[18px]"
                :style="{
                  color: item.color,
                }"
              >
                {{ getPercentage(item.count) }}%
              </strong>
            </div>

            <span
              class="mt-1 text-[12px] leading-4 text-[#8B93A7]"
            >
              {{
                item.count.toLocaleString("vi-VN")
              }}
              thí sinh
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================
         ĐỘ TUỔI
         ===================================================== -->

    <div
      class="min-w-0 rounded-2xl border border-[#232838] bg-[#141824] p-6"
    >
      <!-- Header -->

      <div class="mb-[18px]">
        <h3
          class="text-[16px] font-semibold leading-6 text-[#F8FAFC]"
        >
          Phân bố theo nhóm tuổi
        </h3>

        <p
          class="mt-1 text-[13px] font-normal leading-[18px] text-[#8B93A7]"
        >
          Số lượng thí sinh đăng ký theo nhóm tuổi
        </p>
      </div>

      <!-- Chart -->

      <div class="relative h-[280px]">
        <!-- Y axis -->

        <div
          class="absolute bottom-[34px] left-0 top-0 flex w-[40px] flex-col justify-between"
        >
          <span
            v-for="tick in ageChartTicks"
            :key="tick"
            class="text-[12px] leading-4 text-[#8B93A7]"
          >
            {{ formatAgeTick(tick) }}
          </span>
        </div>

        <!-- Chart area -->

        <div
          class="absolute bottom-[34px] left-[46px] right-0 top-0"
        >
          <!-- Horizontal grid lines -->

          <div
            v-for="(_, index) in ageChartTicks"
            :key="index"
            class="absolute inset-x-0 border-t border-[#232838]"
            :style="{
              top: `${(index / (ageChartTicks.length - 1)) * 100}%`,
            }"
          ></div>

          <!-- Bars -->

          <div
            class="absolute inset-0 flex items-end justify-around gap-3 sm:gap-6"
          >
            <div
              v-for="item in ageData"
              :key="item.label"
              class="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <!-- Bar -->

              <div
                class="relative w-full max-w-[160px] rounded-t-[6px] bg-[#F59E0B]"
                :style="{
                  height: getBarHeight(item.value),
                }"
              >
                <!-- Value -->

                <span
                  class="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-[13px] font-semibold leading-4 text-white"
                >
                  {{
                    item.value.toLocaleString("vi-VN")
                  }}
                </span>
              </div>

              <!-- Label -->

              <span
                class="absolute bottom-0 translate-y-full pt-2 text-center text-[12px] leading-4 text-[#8B93A7]"
              >
                {{ item.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>