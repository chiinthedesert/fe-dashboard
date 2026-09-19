<script setup lang="ts">
import { computed, ref } from "vue";
import { Download } from "lucide-vue-next";

interface School {
  name: string;
  region: string;
  registrationCount: number;
  targetGap: number;
  conversionRate: number;
  overdueProfiles: number;
}

/* =========================================================
   DỮ LIỆU TRƯỜNG HỌC
   Mock data hiện tại.
   Sau này API có thể gán vào schoolData.value
   ========================================================= */

const schoolData = ref<School[]>([
  {
    name: "THPT Chuyên Hà Nội - Amsterdam",
    region: "Hà Nội",
    registrationCount: 950,
    targetGap: -12,
    conversionRate: 94.2,
    overdueProfiles: 1,
  },
  {
    name: "THPT Chuyên Lê Hồng Phong",
    region: "TP. Hồ Chí Minh",
    registrationCount: 870,
    targetGap: -5,
    conversionRate: 91.5,
    overdueProfiles: 0,
  },
  {
    name: "THPT Chuyên Phan Bội Châu",
    region: "Nghệ An",
    registrationCount: 760,
    targetGap: -18,
    conversionRate: 82.3,
    overdueProfiles: 4,
  },
  {
    name: "THPT Chuyên Lê Quý Đôn",
    region: "Đà Nẵng",
    registrationCount: 690,
    targetGap: -8,
    conversionRate: 88.7,
    overdueProfiles: 2,
  },
  {
    name: "THPT Chuyên Hùng Vương",
    region: "Gia Lai",
    registrationCount: 620,
    targetGap: -15,
    conversionRate: 79.4,
    overdueProfiles: 3,
  },
  {
    name: "THPT Chuyên Trần Phú",
    region: "Hải Phòng",
    registrationCount: 580,
    targetGap: -2,
    conversionRate: 89.1,
    overdueProfiles: 0,
  },
  {
    name: "THPT Chuyên Lương Thế Vinh",
    region: "Đồng Nai",
    registrationCount: 520,
    targetGap: -22,
    conversionRate: 76.8,
    overdueProfiles: 6,
  },
]);

/* =========================================================
   TOP 7 TRƯỜNG CÓ LƯỢNG ĐĂNG KÝ CAO NHẤT
   ========================================================= */

const topSchools = computed(() => {
  return [...schoolData.value]
    .sort(
      (a, b) =>
        b.registrationCount - a.registrationCount,
    )
    .slice(0, 7);
});

/* =========================================================
   XUẤT EXCEL
   ========================================================= */

function exportExcel() {
  // TODO: Thay bằng API export Excel khi backend có endpoint.
  console.log("Export Excel");
}
</script>

<template>
  <div
    class="min-w-0 rounded-2xl border border-[#232838] bg-[#141824] p-6"
  >
    <!-- =====================================================
         HEADER
         ===================================================== -->

    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3
          class="text-[16px] font-semibold leading-6 text-[#F8FAFC]"
        >
          Xếp hạng hiệu quả tuyển sinh theo Trường học
        </h3>

        <p
          class="mt-1 text-[13px] font-normal leading-[18px] text-[#8B93A7]"
        >
          Danh sách các trường có lượng đăng ký cao nhất kèm phân tích
          chỉ tiêu tuyển sinh
        </p>
      </div>

      <!-- Xuất Excel -->

      <button
        type="button"
        class="flex shrink-0 items-center gap-2 rounded-lg bg-[#34D399] px-4 py-2.5 text-[13px] font-semibold leading-5 text-white transition hover:opacity-90"
        @click="exportExcel"
      >
        <Download class="h-4 w-4" />
        Xuất báo cáo Excel
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
            <th
              class="rounded-l-md px-4 py-3 text-left text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Trường học
            </th>

            <th
              class="px-4 py-3 text-left text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Khu vực
            </th>

            <th
              class="px-4 py-3 text-center text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Target Gap
            </th>

            <th
              class="px-4 py-3 text-center text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Tỉ lệ chuyển đổi
            </th>

            <th
              class="rounded-r-md px-4 py-3 text-center text-[13px] font-medium leading-[18px] text-[#8B93A7]"
            >
              Hồ sơ trễ hạn
            </th>
          </tr>
        </thead>

        <!-- =================================================
             TABLE BODY
             ================================================= -->

        <tbody>
          <tr
            v-for="school in topSchools"
            :key="school.name"
            class="border-b border-[#232838] last:border-b-0"
          >
            <!-- Trường học -->

            <td class="px-4 py-3.5">
              <span
                class="text-[14px] font-semibold leading-5 text-[#F8FAFC]"
              >
                {{ school.name }}
              </span>
            </td>

            <!-- Khu vực -->

            <td class="px-4 py-3.5">
              <span
                class="inline-flex rounded-md bg-[#31245F] px-2 py-1 text-[12px] font-medium leading-4 text-[#8B5CF6]"
              >
                {{ school.region }}
              </span>
            </td>

            <!-- Target Gap -->

            <td class="px-4 py-3.5 text-center">
              <span
                class="text-[13px] font-semibold leading-[18px] text-[#FB7185]"
              >
                {{ school.targetGap }}
              </span>
            </td>

            <!-- Tỉ lệ chuyển đổi -->

            <td class="px-4 py-3.5 text-center">
              <span
                class="text-[13px] font-semibold leading-[18px] text-[#34D399]"
              >
                {{ school.conversionRate }}%
              </span>
            </td>

            <!-- Hồ sơ trễ hạn -->

            <td class="px-4 py-3.5 text-center">
              <span
                v-if="school.overdueProfiles > 0"
                class="inline-flex rounded-md bg-[#3A202D] px-2 py-1 text-[12px] font-medium leading-4 text-[#FB7185]"
              >
                {{ school.overdueProfiles }} trễ hạn
              </span>

              <span
                v-else
                class="text-[12px] font-medium leading-4 text-[#8B93A7]"
              >
                Đúng hạn
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
