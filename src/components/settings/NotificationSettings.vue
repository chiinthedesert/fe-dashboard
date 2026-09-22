<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { BellRing, CreditCard, Mail, Plus, Trash2 } from "lucide-vue-next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/composables/useAuth";

const STORAGE_KEY = "pythonmaster-notifications-demo-v1";
type Frequency = "instant" | "hourly" | "daily" | "weekly";
interface Preferences {
  registrations: boolean;
  payments: boolean;
  recipients: string[];
  frequency: Frequency;
}
const defaults: Preferences = {
  registrations: false,
  payments: false,
  recipients: [],
  frequency: "instant",
};

function readPreferences(): Preferences {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!saved || typeof saved !== "object") return { ...defaults, recipients: [] };
    const value = saved as Partial<Preferences>;
    const recipients = Array.isArray(value.recipients)
      ? value.recipients.filter((item): item is string => typeof item === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)).slice(0, 5)
      : [];
    return {
      registrations: value.registrations === true,
      payments: value.payments === true,
      recipients,
      frequency: ["instant", "hourly", "daily", "weekly"].includes(value.frequency ?? "")
        ? value.frequency! : "instant",
    };
  } catch {
    return { ...defaults, recipients: [] };
  }
}

const preferences = reactive<Preferences>(readPreferences());
const newEmail = ref("");
const emailError = ref("");
const { currentAdmin } = useAuth();
const primaryEmail = computed(() => currentAdmin.value?.email?.trim() ?? "");
const maxAdditional = computed(() => Math.max(0, 5 - (primaryEmail.value ? 1 : 0)));
const canAdd = computed(() => preferences.recipients.length < maxAdditional.value);

watch(preferences, () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    emailError.value = "Trình duyệt không thể lưu cài đặt minh họa.";
  }
}, { deep: true });

function addEmail() {
  emailError.value = "";
  const value = newEmail.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    emailError.value = "Vui lòng nhập địa chỉ email hợp lệ.";
    return;
  }
  if (!canAdd.value) {
    emailError.value = "Đã đạt giới hạn 5 email (bao gồm email chính).";
    return;
  }
  if ([primaryEmail.value, ...preferences.recipients].some((email) => email.toLowerCase() === value.toLowerCase())) {
    emailError.value = "Email này đã có trong danh sách.";
    return;
  }
  preferences.recipients.push(value);
  newEmail.value = "";
}

const frequencies: { value: Frequency; label: string; description: string }[] = [
  { value: "instant", label: "Ngay lập tức", description: "Gửi khi có sự kiện mới." },
  { value: "hourly", label: "Tổng hợp mỗi giờ", description: "Gom sự kiện và gửi mỗi giờ." },
  { value: "daily", label: "Tổng hợp hằng ngày", description: "Gửi báo cáo vào buổi sáng." },
  { value: "weekly", label: "Tổng hợp hằng tuần", description: "Gửi báo cáo vào đầu tuần." },
];
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
    <div role="note" class="rounded-xl border border-dashed bg-muted/50 p-3 text-sm text-muted-foreground">
      <Badge variant="outline" class="mb-1">Chức năng minh họa</Badge>
      <p>Các lựa chọn dưới đây chỉ được lưu trên trình duyệt này. Hệ thống chưa gửi email hay thông báo thực tế.</p>
    </div>
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Loại thông báo</CardTitle>
        <CardDescription>Chọn sự kiện bạn muốn nhận thông báo trong phiên bản sau.</CardDescription>
      </CardHeader>
      <CardContent class="divide-y">
        <div class="flex items-center gap-3 pb-4">
          <div class="rounded-lg bg-primary/10 p-2 text-primary"><BellRing class="size-5" /></div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">Thí sinh đăng ký mới</p>
            <p class="text-xs text-muted-foreground">Thông báo khi có thí sinh hoàn tất đăng ký dự thi.</p>
          </div>
          <button type="button" role="switch" :aria-checked="preferences.registrations" aria-label="Thông báo thí sinh mới (minh họa)" class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" :class="preferences.registrations ? 'bg-primary' : 'bg-muted-foreground/40'" @click="preferences.registrations = !preferences.registrations">
            <span class="absolute top-1 left-1 size-4 rounded-full bg-white transition-transform" :class="preferences.registrations ? 'translate-x-5' : ''" />
          </button>
        </div>
        <div class="flex items-center gap-3 pt-4">
          <div class="rounded-lg bg-primary/10 p-2 text-primary"><CreditCard class="size-5" /></div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">Thanh toán</p>
            <p class="text-xs text-muted-foreground">Thông báo khi giao dịch lệ phí thành công hoặc thất bại.</p>
          </div>
          <button type="button" role="switch" :aria-checked="preferences.payments" aria-label="Thông báo thanh toán (minh họa)" class="relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" :class="preferences.payments ? 'bg-primary' : 'bg-muted-foreground/40'" @click="preferences.payments = !preferences.payments">
            <span class="absolute top-1 left-1 size-4 rounded-full bg-white transition-transform" :class="preferences.payments ? 'translate-x-5' : ''" />
          </button>
        </div>
      </CardContent>
    </Card>

    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Email nhận thông báo</CardTitle>
        <CardDescription>Tối đa 5 email gồm email tài khoản. Danh sách này chỉ là bản xem trước, chưa được đăng ký nhận email.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-if="primaryEmail" class="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2">
          <Mail class="size-4 text-muted-foreground" />
          <span class="min-w-0 flex-1 break-all text-sm">{{ primaryEmail }}</span>
          <Badge variant="secondary">Email chính</Badge>
        </div>
        <div v-for="email in preferences.recipients" :key="email" class="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2">
          <Mail class="size-4 shrink-0 text-muted-foreground" />
          <span class="min-w-0 flex-1 break-all text-sm">{{ email }}</span>
          <Button type="button" size="icon" variant="ghost" :aria-label="`Xóa ${email}`" @click="preferences.recipients = preferences.recipients.filter((item) => item !== email)"><Trash2 class="size-4" /></Button>
        </div>
        <form class="flex min-w-0 flex-col gap-2 sm:flex-row" @submit.prevent="addEmail">
          <Input v-model="newEmail" type="email" placeholder="Nhập email cần thêm" aria-label="Email minh họa cần thêm" :disabled="!canAdd" required />
          <Button type="submit" variant="outline" :disabled="!canAdd" class="shrink-0"><Plus class="size-4" /> Thêm</Button>
        </form>
        <p v-if="emailError" role="alert" class="text-sm text-destructive">{{ emailError }}</p>
        <p class="text-xs text-muted-foreground">{{ preferences.recipients.length + (primaryEmail ? 1 : 0) }}/5 email · Lưu trên trình duyệt này</p>
      </CardContent>
    </Card>

    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Tần suất thông báo</CardTitle>
        <CardDescription>Bố cục minh họa cho lịch gửi email trong tương lai; chưa có tác vụ gửi được lên lịch.</CardDescription>
      </CardHeader>
      <CardContent role="radiogroup" aria-label="Tần suất thông báo minh họa" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button v-for="item in frequencies" :key="item.value" type="button" role="radio" :aria-checked="preferences.frequency === item.value" class="flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring" :class="preferences.frequency === item.value ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'" @click="preferences.frequency = item.value">
          <span class="mt-1.5 size-3 shrink-0 rounded-full border" :class="preferences.frequency === item.value ? 'border-4 border-primary' : 'border-muted-foreground'" />
          <span class="min-w-0"><span class="block text-sm font-medium">{{ item.label }}</span><span class="block text-xs text-muted-foreground">{{ item.description }}</span></span>
        </button>
      </CardContent>
    </Card>
  </div>
</template>
