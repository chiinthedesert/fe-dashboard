<script setup lang="ts">
import { computed, ref } from "vue";
import { Download, TriangleAlert } from "lucide-vue-next";

interface School {
  name: string;
  region: string;

  // Số lượng còn thiếu so với mục tiêu tuần
  missingTarget: number;

  conversionRate: number;

  // Số ngày quá hạn
  overdueDays: number;
}

/* =========================================================
   DỮ LIỆU TRƯỜNG HỌC
   Mock data
   ========================================================= */

const schoolData = ref<School[]>([
  {
    name: "THPT Chuyên Lê Hồng Phong",
    region: "TP. Hồ Chí Minh",
    missingTarget: 420,
    conversionRate: 38,
    overdueDays: 12,
  },
  {
    name: "THPT Chuyên Hà Nội - Amsterdam",
    region: "Hà Nội",
    missingTarget: 310,
    conversionRate: 42,
    overdueDays: 8,
  },
  {
    name: "THPT Chuyên Lê Quý Đôn",
    region: "Đà Nẵng",
    missingTarget: 285,
    conversionRate: 35,
    overdueDays: 15,
  },
  {
    name: "THPT Nguyễn Thị Minh Khai",
    region: "TP. Hồ Chí Minh",
    missingTarget: 260,
    conversionRate: 44,
    overdueDays: 6,
  },
  {
    name: "THPT Chuyên Trần Đại Nghĩa",
    region: "TP. Hồ Chí Minh",
    missingTarget: 198,
    conversionRate: 47,
    overdueDays: 4,
  },
  {
    name: "THPT Chu Văn An",
    region: "Hà Nội",
    missingTarget: 175,
    conversionRate: 51,
    overdueDays: 0,
  },
  {
    name: "THPT Chuyên Quốc Học Huế",
    region: "Thừa Thiên Huế",
    missingTarget: 152,
    conversionRate: 49,
    overdueDays: 3,
  },
  {
    name: "THPT Chuyên Lê Khiết",
    region: "Quảng Ngãi",
    missingTarget: 140,
    conversionRate: 46,
    overdueDays: 9,
  },
  {
    name: "THPT Chuyên Nguyễn Bỉnh Khiêm",
    region: "TP. Hồ Chí Minh",
    missingTarget: 95,
    conversionRate: 53,
    overdueDays: 0,
  },
  {
    name: "THPT Việt Đức",
    region: "Hà Nội",
    missingTarget: 60,
    conversionRate: 58,
    overdueDays: 0,
  },
]);

/* =========================================================
   XẾP HẠNG TRƯỜNG
   Sắp xếp theo số lượng còn thiếu mục tiêu giảm dần
   ========================================================= */

const rankedSchools = computed(() => {
  return [...schoolData.value]
    .sort(
      (a, b) =>
        b.missingTarget - a.missingTarget,
    )
    .slice(0, 10);
});

/* =========================================================
   XUẤT BÁO CÁO
   ========================================================= */

function exportExcel() {
  // TODO:
  // Thay bằng API export Excel khi backend có endpoint.
  console.log("Export báo cáo Excel");
}
</script>

<template>
  <div
    class="min-w-0 rounded-2xl border border-[#232838] bg-[#141824] p-6"
  >
    <!-- =====================================================
         HEADER
         ===================================================== -->

    <div class="mb-5 flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h3
          class="text-[16px] font-semibold leading-6 text-[#F8FAFC]"
        >
          Trường học cần thúc đẩy
        </h3>

        <p
          class="mt-1 text-[13px] font-normal leading-[18px] text-[#8B93A7]"
        >
          Xếp hạng theo số lượng còn thiếu so với mục tiêu đăng ký trong tuần
        </p>
      </div>

      <!-- Xuất báo cáo -->

      <button
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-lg bg-[#34D399] px-4 py-2.5 text-[13px] font-semibold leading-5 text-white transition hover:opacity-90"
        @click="exportExcel"
      >
        <Download class="h-4 w-4" />
        <span class="hidden sm:inline">
          Xuất báo cáo
        </span>
        <span class="sm:hidden">
          Xuất
        </span>
      </button>
    </div>

    <!-- =====================================================
         TABLE
         ===================================================== -->

    <div class="min-w-0 overflow-x-auto">
      <table class="w-full min-w-[900px] border-collapse">
        <!-- =================================================
             TABLE HEADER
             ================================================= -->

        <thead>
          <tr class="bg-[#1D2233]">
            <!-- STT -->

            <th
              class="w-[48px] rounded-l-md px-3 py-3 text-center text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              #
            </th>

            <!-- TRƯỜNG -->

            <th
              class="px-4 py-3 text-left text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Trường
            </th>

            <!-- KHU VỰC -->

            <th
              class="px-4 py-3 text-left text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Khu vực
            </th>

            <!-- THIẾU MỤC TIÊU -->

            <th
              class="px-4 py-3 text-center text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Thiếu mục tiêu tuần
            </th>

            <!-- TỈ LỆ CHUYỂN ĐỔI -->

            <th
              class="px-4 py-3 text-center text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Tỷ lệ chuyển đổi
            </th>

            <!-- QUÁ HẠN -->

            <th
              class="rounded-r-md px-4 py-3 text-center text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Quá hạn (ngày)
            </th>
          </tr>
        </thead>

        <!-- =================================================
             TABLE BODY
             ================================================= -->

        <tbody>
          <tr
            v-for="(school, index) in rankedSchools"
            :key="school.name"
            class="border-b border-[#232838] last:border-b-0"
          >
            <!-- STT -->

            <td
              class="px-3 py-3.5 text-center"
            >
              <span
                class="text-[13px] font-normal leading-[18px] text-[#8B93A7]"
              >
                {{ index + 1 }}
              </span>
            </td>

            <!-- TRƯỜNG -->

            <td class="px-4 py-3.5">
              <span
                class="text-[14px] font-semibold leading-5 text-[#F8FAFC]"
              >
                {{ school.name }}
              </span>
            </td>

            <!-- KHU VỰC -->

            <td class="px-4 py-3.5">
              <span
                class="inline-flex rounded-md bg-[#31245F] px-2 py-1 text-[12px] font-medium leading-4 text-[#8B5CF6]"
              >
                {{ school.region }}
              </span>
            </td>

            <!-- THIẾU MỤC TIÊU -->

            <td
              class="px-4 py-3.5 text-center"
            >
              <span
                class="text-[13px] font-semibold leading-[18px] text-[#FB7185]"
              >
                {{ school.missingTarget.toLocaleString("vi-VN") }}
              </span>
            </td>

            <!-- TỈ LỆ CHUYỂN ĐỔI -->

            <td
              class="px-4 py-3.5 text-center"
            >
              <span
                class="text-[13px] font-semibold leading-[18px] text-[#34D399]"
              >
                {{ school.conversionRate }}%
              </span>
            </td>

            <!-- QUÁ HẠN -->

            <td
              class="px-4 py-3.5 text-center"
            >
              <span
                v-if="school.overdueDays > 0"
                class="inline-flex items-center justify-center gap-1 text-[13px] font-medium leading-[18px] text-[#FB7185]"
              >
                <TriangleAlert class="h-3.5 w-3.5" />
                {{ school.overdueDays }}
              </span>

              <span
                v-else
                class="text-[13px] font-medium leading-[18px] text-[#8B93A7]"
              >
                —
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>