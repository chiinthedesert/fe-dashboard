<script setup lang="ts">
import type { CandidateResponse } from "@/types/candidate-api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const props = defineProps<{
  open: boolean;
  candidate: CandidateResponse | null;
  loading: boolean;
  error: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const numberFormatter = new Intl.NumberFormat("vi-VN");

function display(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function sourceLabel(value: string | null | undefined): string {
  if (value === "DATA") return "Data";
  if (value === "GGFORM") return "Google Form";
  if (value === "FBADS") return "Facebook Ads";
  return display(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${numberFormatter.format(value)} VNĐ`;
}

function boardVariant(
  value: string | null | undefined,
): "default" | "secondary" | "outline" {
  const normalized = value?.trim().toLocaleLowerCase("vi") ?? "";

  if (["bảng a", "table_a", "a"].includes(normalized)) return "default";
  if (["bảng b", "table_b", "b"].includes(normalized)) return "secondary";
  return "outline";
}

function statusVariant(
  key: string | null | undefined,
): "default" | "secondary" | "outline" | "destructive" {
  if (key === "DA_DONG_PHI") return "default";
  if (key === "CHUA_DONG_PHI") return "destructive";
  if (key === "CHO_HO_SO") return "outline";
  return "secondary";
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Chi tiết thí sinh</DialogTitle>
        <DialogDescription>
          Thông tin hồ sơ, đăng ký, thanh toán và phân công Sale.
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="loading"
        class="flex min-h-64 items-center justify-center text-sm text-muted-foreground"
      >
        Đang tải thông tin thí sinh...
      </div>

      <p
        v-else-if="error"
        role="alert"
        class="flex min-h-64 items-center justify-center text-center text-sm text-destructive"
      >
        {{ error }}
      </p>

      <div v-else-if="candidate" class="grid gap-5">
        <section class="grid gap-3">
          <h3 class="text-sm font-semibold">Thông tin cá nhân</h3>
          <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted-foreground">Mã thí sinh</dt>
              <dd class="text-sm font-medium">{{ display(candidate.idThiSinh) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Họ và tên</dt>
              <dd class="text-sm font-medium">{{ display(candidate.hoTen) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Ngày sinh</dt>
              <dd class="text-sm">{{ formatDate(candidate.ngaySinh) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">CCCD</dt>
              <dd class="text-sm tabular-nums">{{ display(candidate.cccd) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Email</dt>
              <dd class="text-sm break-all">{{ display(candidate.email) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Số điện thoại</dt>
              <dd class="text-sm tabular-nums">{{ display(candidate.soDienThoai) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Tỉnh / Thành phố</dt>
              <dd class="text-sm">{{ display(candidate.tinhThanh) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Địa chỉ</dt>
              <dd class="text-sm">{{ display(candidate.diaChi) }}</dd>
            </div>
          </dl>
        </section>

        <div class="border-t" />

        <section class="grid gap-3">
          <h3 class="text-sm font-semibold">Thông tin dự thi</h3>
          <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted-foreground">Trường học / Đơn vị</dt>
              <dd class="text-sm">{{ display(candidate.truongHoc) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Bảng đấu</dt>
              <dd class="mt-1">
                <Badge :variant="boardVariant(candidate.bangDau)">
                  {{ display(candidate.bangDau) }}
                </Badge>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Nguồn đăng ký</dt>
              <dd class="text-sm">{{ sourceLabel(candidate.nguonDangKy) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Đối tác giới thiệu</dt>
              <dd class="text-sm">{{ display(candidate.doiTac) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Nhân viên Sale</dt>
              <dd class="text-sm">{{ display(candidate.assignedSaleName) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">ID Sale</dt>
              <dd class="text-sm tabular-nums">{{ display(candidate.assignedSaleId) }}</dd>
            </div>
          </dl>
        </section>

        <div class="border-t" />

        <section class="grid gap-3">
          <h3 class="text-sm font-semibold">Hồ sơ & Thanh toán</h3>
          <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted-foreground">Trạng thái thí sinh</dt>
              <dd class="mt-1">
                <Badge :variant="statusVariant(candidate.trangThaiKey)">
                  {{ display(candidate.trangThai) }}
                </Badge>
              </dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Trạng thái hồ sơ</dt>
              <dd class="text-sm">{{ display(candidate.trangThaiHoSo) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Trạng thái thanh toán</dt>
              <dd class="text-sm">{{ display(candidate.paymentStatus) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Số tiền</dt>
              <dd class="text-sm font-medium tabular-nums">
                {{ formatMoney(candidate.soTien) }}
              </dd>
            </div>
          </dl>
        </section>

        <div class="border-t" />

        <section class="grid gap-3">
          <h3 class="text-sm font-semibold">Thời gian</h3>
          <dl class="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt class="text-xs text-muted-foreground">Ngày đăng ký</dt>
              <dd class="text-sm tabular-nums">{{ formatDateTime(candidate.ngayDangKy) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Ngày tạo hồ sơ</dt>
              <dd class="text-sm tabular-nums">{{ formatDateTime(candidate.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted-foreground">Cập nhật gần nhất</dt>
              <dd class="text-sm tabular-nums">{{ formatDateTime(candidate.updatedAt) }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="emit('update:open', false)">
          Đóng
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
