<script setup lang="ts">
import { computed } from "vue";

import {
  Users,
  CreditCard,
  Wallet,
  UserRoundX,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-vue-next";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import type { DashboardKpis } from "@/types/dashboard-api";

// Props

const props = defineProps<{
  data: DashboardKpis | null;
  loading: boolean;
}>();

// Formatters

function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";

  return value.toLocaleString("vi-VN");
}

function formatPercent(
  value: number | null | undefined,
  signed = false,
): string {
  if (value == null) return "—";

  const sign = signed && value > 0 ? "+" : "";

  return `${sign}${value.toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  })}%`;
}

function formatCurrency(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amount == null) return "—";

  return `${formatNumber(amount)} ${currency || "VND"}`;
}

// Card data

const cards = computed(() => {
  const data = props.data;

  return [
    {
      key: "registration",
      title: "Tổng lượt đăng ký",
      icon: Users,
      value: formatNumber(data?.registration?.count),
      growth: data?.registration?.growthRate,
      footer: data?.registration?.growthLabel || "So với kỳ trước",
    },
    {
      key: "conversion",
      title: "Tỷ lệ chuyển đổi",
      icon: CreditCard,
      value: formatPercent(data?.conversion?.rate),
      growth: data?.conversion?.deltaRate,
      footer: data?.conversion?.description || "",
    },
    {
      key: "revenue",
      title: "Doanh thu tạm tính",
      icon: Wallet,
      value: formatCurrency(data?.revenue?.amount, data?.revenue?.currency),
      growth: data?.revenue?.growthRate,
      footer: data?.revenue?.description || "",
    },
    {
      key: "leadFollowUp",
      title: "Lead cần chăm sóc lại",
      icon: UserRoundX,
      value: formatNumber(data?.leadFollowUp?.count),
      growth: data?.leadFollowUp?.growthRate,
      footer: data?.leadFollowUp?.description || "",
    },
    {
      key: "targetGap",
      title: "Chênh lệch mục tiêu",
      icon: Target,
      value: formatNumber(data?.targetGap?.gap),
      growth: data?.targetGap?.gapRate,
      footer: data?.targetGap?.description || "",
    },
  ];
});
</script>

<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-3 min-[68rem]:grid-cols-5">
    <Card v-for="card in cards" :key="card.key" class="min-w-0 gap-4 py-4">
      <!-- Card header -->

      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div class="rounded-lg bg-muted p-2">
          <component :is="card.icon" class="size-5 text-muted-foreground" />
        </div>

        <Badge
          v-if="card.growth != null"
          variant="outline"
          class="gap-1"
          :class="
            card.growth >= 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-700 dark:text-red-400'
          "
        >
          <TrendingUp v-if="card.growth >= 0" class="size-3.5" />

          <TrendingDown v-else class="size-3.5" />

          {{ formatPercent(card.growth, true) }}
        </Badge>
      </CardHeader>

      <!-- Card content -->

      <CardContent class="min-w-0 space-y-1">
        <p
          class="wrap-break-word text-2xl font-semibold tabular-nums md:text-3xl"
        >
          {{ loading ? "—" : card.value }}
        </p>

        <h3 class="text-sm font-medium text-muted-foreground">
          {{ card.title }}
        </h3>
      </CardContent>

      <!-- Card footer -->

      <CardFooter class="mt-auto text-xs text-muted-foreground">
        {{ loading ? "Đang tải..." : card.footer }}
      </CardFooter>
    </Card>
  </div>
</template>
