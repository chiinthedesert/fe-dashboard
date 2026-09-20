<script setup lang="ts">
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
</script>

<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-3 min-[68rem]:grid-cols-5">
    <Card class="min-w-0 gap-4">
      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div class="rounded-lg bg-muted p-2">
          <Users class="size-5 text-muted-foreground" />
        </div>

        <Badge
          variant="outline"
          class="gap-1 text-emerald-700 dark:text-emerald-400"
        >
          <TrendingUp class="size-3.5" />
          +8,2%
        </Badge>
      </CardHeader>

      <CardContent class="space-y-1">
        <p class="text-3xl font-semibold tabular-nums">12.480</p>
        <h3 class="text-sm font-medium text-muted-foreground">
          Tổng lượt đăng ký
        </h3>
      </CardContent>

      <CardFooter class="mt-auto text-xs text-muted-foreground">
        So với kỳ trước
      </CardFooter>
    </Card>

    <Card class="min-w-0 gap-4 py-4">
      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div class="rounded-lg bg-muted p-2">
          <CreditCard class="size-5 text-muted-foreground" />
        </div>

        <Badge variant="outline" class="gap-1 text-red-700 dark:text-red-400">
          <TrendingDown class="size-3.5" />
          -2,1%
        </Badge>
      </CardHeader>

      <CardContent class="space-y-1">
        <p class="text-3xl font-semibold tabular-nums">64,3%</p>
        <h3 class="text-sm font-medium text-muted-foreground">
          Tỷ lệ chuyển đổi thanh toán
        </h3>
      </CardContent>

      <CardFooter class="mt-auto text-xs text-muted-foreground">
        Trên tổng số đăng ký
      </CardFooter>
    </Card>

    <Card class="min-w-0 gap-4 py-4">
      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div class="rounded-lg bg-muted p-2">
          <Wallet class="size-5 text-muted-foreground" />
        </div>

        <Badge
          variant="outline"
          class="gap-1 text-emerald-700 dark:text-emerald-400"
        >
          <TrendingUp class="size-3.5" />
          +12,4%
        </Badge>
      </CardHeader>

      <CardContent class="space-y-1">
        <p class="text-3xl font-semibold tabular-nums">324</p>
        <h3 class="text-sm font-medium text-muted-foreground">
          Doanh thu tạm tính
        </h3>
      </CardContent>

      <CardFooter class="mt-auto text-xs text-muted-foreground">
        Đơn vị triệu VND
      </CardFooter>
    </Card>

    <Card class="min-w-0 gap-4 py-4">
      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div class="rounded-lg bg-muted p-2">
          <UserRoundX class="size-5 text-muted-foreground" />
        </div>

        <Badge variant="outline" class="gap-1 text-red-700 dark:text-red-400">
          <TrendingUp class="size-3.5" />
          +5,6%
        </Badge>
      </CardHeader>

      <CardContent class="space-y-1">
        <p class="text-3xl font-semibold tabular-nums">842</p>
        <h3 class="text-sm font-medium text-muted-foreground">
          Lead cần chăm sóc lại
        </h3>
      </CardContent>

      <CardFooter class="mt-auto text-xs text-muted-foreground">
        Chưa hoàn tất thanh toán
      </CardFooter>
    </Card>

    <Card class="min-w-0 gap-4 py-4">
      <CardHeader class="flex flex-row items-center justify-between gap-2">
        <div class="rounded-lg bg-muted p-2">
          <Target class="size-5 text-muted-foreground" />
        </div>

        <Badge variant="outline" class="gap-1 text-red-700 dark:text-red-400">
          <TrendingDown class="size-3.5" />
          -9,3%
        </Badge>
      </CardHeader>

      <CardContent class="space-y-1">
        <p class="text-3xl font-semibold tabular-nums">-1.240</p>
        <h3 class="text-sm font-medium text-muted-foreground">
          Chênh lệch mục tiêu
        </h3>
      </CardContent>

      <CardFooter class="mt-auto text-xs text-muted-foreground">
        So với mục tiêu tuần
      </CardFooter>
    </Card>
  </div>
</template>
