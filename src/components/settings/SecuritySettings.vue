<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Monitor, Smartphone, ShieldOff, LogOut, Info } from "lucide-vue-next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/composables/useAuth";
import { logoutCurrentSession } from "@/composables/useLogout";
import { readIdleMinutes, writeIdleMinutes } from "@/composables/useIdleLogout";

const router = useRouter();
const { currentAdmin } = useAuth();
const idleMinutes = ref(readIdleMinutes());
const signingOut = ref(false);
const preferenceError = ref("");

function changeIdleMinutes(event: Event) {
  const next = Number((event.target as HTMLSelectElement).value);
  preferenceError.value = "";
  try {
    writeIdleMinutes(next);
    idleMinutes.value = next;
  } catch {
    preferenceError.value = "Không thể lưu cài đặt thời gian đăng xuất trong trình duyệt này.";
  }
}

async function signOut() {
  if (signingOut.value) return;
  signingOut.value = true;
  await logoutCurrentSession();
  await router.replace({ name: "login" });
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Phiên đăng nhập</CardTitle>
        <CardDescription>Chỉ có thông tin phiên đăng nhập hiện tại; backend chưa cung cấp danh sách các thiết bị khác.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <div class="rounded-lg bg-muted p-2"><Monitor class="size-4" /></div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">Trình duyệt hiện tại <Badge variant="secondary" class="ml-1">Thiết bị này</Badge></p>
            <p class="text-xs text-muted-foreground">{{ currentAdmin?.username || 'Admin' }} · Phiên đang mở trên trình duyệt này</p>
          </div>
          <Button size="sm" variant="outline" :disabled="signingOut" @click="signOut">Đăng xuất</Button>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div class="min-w-0">
            <label for="idle-minutes" class="text-sm font-medium">Tự động đăng xuất khi không hoạt động</label>
            <p class="text-xs text-muted-foreground">Chỉ áp dụng cho phiên trên trình duyệt này. Không thay đổi thời hạn JWT do server cấp.</p>
          </div>
          <select id="idle-minutes" :value="idleMinutes" class="h-9 min-w-32 rounded-md border border-input bg-background px-3 text-sm" @change="changeIdleMinutes">
            <option :value="0">Tắt</option>
            <option :value="15">15 phút</option>
            <option :value="30">30 phút</option>
            <option :value="60">60 phút</option>
          </select>
        </div>
        <p v-if="preferenceError" role="alert" class="text-sm text-destructive">{{ preferenceError }}</p>
      </CardContent>
    </Card>

    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Xác thực hai bước (2FA)</CardTitle>
        <CardDescription>Bảo vệ tài khoản bằng mã xác thực bổ sung khi đăng nhập.</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <div class="rounded-lg bg-muted p-2 text-muted-foreground"><ShieldOff class="size-5" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium">Chưa hỗ trợ xác thực hai bước</p>
          <p class="text-xs text-muted-foreground">Backend chưa cung cấp đăng ký, xác minh hoặc đăng nhập bằng 2FA.</p>
        </div>
        <Badge variant="outline">Chưa khả dụng</Badge>
      </CardContent>
    </Card>

    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Quản lý thiết bị</CardTitle>
        <CardDescription>Quản lý các phiên đăng nhập từ những thiết bị khác.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-start gap-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <Info class="mt-0.5 size-4 shrink-0" />
          <p>Không hiển thị thiết bị mẫu như phiên đăng nhập thật. Backend cần API danh sách phiên và thu hồi từng phiên để quản lý thiết bị.</p>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div class="flex items-center gap-2">
            <Smartphone class="size-4 text-muted-foreground" />
            <div><p class="text-sm font-medium">Đăng xuất tất cả thiết bị</p><p class="text-xs text-muted-foreground">Chưa có API thu hồi toàn bộ phiên.</p></div>
          </div>
          <Button type="button" variant="outline" disabled><LogOut class="size-4" /> Chưa khả dụng</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
