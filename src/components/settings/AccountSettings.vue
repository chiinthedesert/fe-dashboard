<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Eye, EyeOff, RotateCcw, Save, KeyRound, LogOut, UserRound } from "lucide-vue-next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/composables/useAuth";
import { logoutCurrentSession } from "@/composables/useLogout";
import { getAdminProfile, updateAdminProfile, verifyCurrentPassword } from "@/services/admin";
import type { Admin } from "@/types/auth";

const router = useRouter();
const { currentAdmin, updateCurrentAdmin } = useAuth();
const admin = ref<Admin | null>(currentAdmin.value);
const loading = ref(true);
const loadError = ref("");
const savingProfile = ref(false);
const profileError = ref("");
const profileSuccess = ref("");
const savingPassword = ref(false);
const passwordError = ref("");
const loggingOut = ref(false);
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

const profile = reactive({ hoTen: "", email: "", soDienThoai: "", currentPassword: "" });
const passwords = reactive({ current: "", next: "", confirm: "" });
const passwordFields = [
  { id: "old-password", label: "Mật khẩu hiện tại", key: "current", autocomplete: "current-password" },
  { id: "new-password", label: "Mật khẩu mới", key: "next", autocomplete: "new-password" },
  { id: "confirm-password", label: "Xác nhận mật khẩu mới", key: "confirm", autocomplete: "new-password" },
] as const;

function fillProfile(value: Admin) {
  profile.hoTen = value.hoTen ?? "";
  profile.email = value.email ?? "";
  profile.soDienThoai = value.soDienThoai ?? "";
  profile.currentPassword = "";
}

function undoProfile() {
  if (admin.value) fillProfile(admin.value);
  profileError.value = "";
  profileSuccess.value = "";
}

const profileChanged = computed(() => Boolean(admin.value) && (
  profile.hoTen.trim() !== (admin.value?.hoTen ?? "") ||
  profile.email.trim() !== (admin.value?.email ?? "") ||
  profile.soDienThoai.trim() !== (admin.value?.soDienThoai ?? "")
));

const initials = computed(() => {
  const name = admin.value?.hoTen?.trim() || admin.value?.username || "A";
  return name.split(/\s+/).slice(-2).map((part) => part[0]?.toUpperCase()).join("");
});

const strengthChecks = computed(() => [
  { label: "Tối thiểu 8 ký tự", ok: passwords.next.length >= 8 },
  { label: "Có chữ hoa và chữ thường", ok: /[a-z]/.test(passwords.next) && /[A-Z]/.test(passwords.next) },
  { label: "Có ít nhất 1 chữ số", ok: /\d/.test(passwords.next) },
  { label: "Có ký tự đặc biệt", ok: /[^\da-zA-Z]/.test(passwords.next) },
]);
const strength = computed(() => strengthChecks.value.filter((item) => item.ok).length);

onMounted(async () => {
  try {
    const value = await getAdminProfile();
    admin.value = value;
    updateCurrentAdmin(value);
    fillProfile(value);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "Không thể tải thông tin tài khoản.";
    if (admin.value) fillProfile(admin.value);
  } finally {
    loading.value = false;
  }
});

async function saveProfile() {
  if (!admin.value || savingProfile.value || !profileChanged.value) return;
  profileError.value = "";
  profileSuccess.value = "";
  if (!profile.currentPassword) {
    profileError.value = "Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.";
    return;
  }
  savingProfile.value = true;
  try {
    await verifyCurrentPassword(admin.value.username, profile.currentPassword);
    const updated = await updateAdminProfile({
      username: admin.value.username,
      password: profile.currentPassword,
      hoTen: profile.hoTen.trim(),
      email: profile.email.trim(),
      soDienThoai: profile.soDienThoai.trim(),
    });
    admin.value = updated;
    updateCurrentAdmin(updated);
    fillProfile(updated);
    profileSuccess.value = "Đã lưu thay đổi tài khoản.";
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : "Không thể cập nhật tài khoản.";
  } finally {
    profile.currentPassword = "";
    savingProfile.value = false;
  }
}

async function changePassword() {
  if (!admin.value || savingPassword.value) return;
  passwordError.value = "";
  if (strength.value !== 4) {
    passwordError.value = "Mật khẩu mới chưa đáp ứng các yêu cầu bên cạnh.";
    return;
  }
  if (passwords.next !== passwords.confirm) {
    passwordError.value = "Xác nhận mật khẩu mới không khớp.";
    return;
  }
  if (passwords.current === passwords.next) {
    passwordError.value = "Mật khẩu mới phải khác mật khẩu hiện tại.";
    return;
  }
  savingPassword.value = true;
  try {
    await verifyCurrentPassword(admin.value.username, passwords.current);
    await updateAdminProfile({
      username: admin.value.username,
      password: passwords.next,
      hoTen: admin.value.hoTen ?? "",
      email: admin.value.email ?? "",
      soDienThoai: admin.value.soDienThoai ?? "",
    });
    passwords.current = "";
    passwords.next = "";
    passwords.confirm = "";
    await logoutCurrentSession();
    await router.replace({ name: "login" });
  } catch (error) {
    passwordError.value = error instanceof Error ? error.message : "Không thể đổi mật khẩu.";
  } finally {
    savingPassword.value = false;
  }
}

async function signOut() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  await logoutCurrentSession();
  await router.replace({ name: "login" });
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
    <Card class="min-w-0 gap-4">
      <CardHeader>
        <CardTitle>Thông tin admin</CardTitle>
        <CardDescription>Thông tin hiển thị trong hệ thống và dùng để liên hệ khi cần.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <p v-if="loadError" role="alert" class="text-sm text-destructive">{{ loadError }}</p>
        <p v-if="loading" class="text-sm text-muted-foreground">Đang tải thông tin tài khoản...</p>
        <template v-else-if="admin">
          <div class="flex min-w-0 items-center gap-3">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full border bg-primary/10 font-semibold text-primary">
              {{ initials }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">{{ admin.hoTen || admin.username }}</p>
              <p class="truncate text-xs text-muted-foreground">Quản trị viên · @{{ admin.username }}</p>
            </div>
          </div>

          <form class="space-y-4" @submit.prevent="saveProfile">
            <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label for="settings-name" class="text-sm font-medium">Họ và tên</label>
                <Input id="settings-name" v-model="profile.hoTen" autocomplete="name" :disabled="savingProfile" maxlength="150" />
              </div>
              <div class="space-y-1.5">
                <label for="settings-username" class="text-sm font-medium">Tên đăng nhập</label>
                <Input id="settings-username" :model-value="admin.username" readonly class="text-muted-foreground" />
              </div>
              <div class="space-y-1.5">
                <label for="settings-email" class="text-sm font-medium">Email</label>
                <Input id="settings-email" v-model="profile.email" type="email" autocomplete="email" :disabled="savingProfile" />
              </div>
              <div class="space-y-1.5">
                <label for="settings-phone" class="text-sm font-medium">Số điện thoại</label>
                <Input id="settings-phone" v-model="profile.soDienThoai" type="tel" autocomplete="tel" :disabled="savingProfile" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label for="settings-confirm-profile" class="text-sm font-medium">Mật khẩu hiện tại <span class="text-destructive">*</span></label>
              <Input
                id="settings-confirm-profile"
                v-model="profile.currentPassword"
                type="password"
                autocomplete="current-password"
                placeholder="Xác nhận trước khi lưu thay đổi"
                :disabled="savingProfile"
                required
              />
              <p class="text-xs text-muted-foreground">API hiện yêu cầu gửi mật khẩu khi cập nhật tài khoản. Mật khẩu hiện tại chỉ dùng cho lần lưu này, không được lưu vào trình duyệt.</p>
            </div>
            <p v-if="profileError" role="alert" class="text-sm text-destructive">{{ profileError }}</p>
            <p v-if="profileSuccess" role="status" class="text-sm text-emerald-600 dark:text-emerald-400">{{ profileSuccess }}</p>
            <div class="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" :disabled="savingProfile || !profileChanged" @click="undoProfile">
                <RotateCcw class="size-4" /> Hoàn tác
              </Button>
              <Button type="submit" :disabled="savingProfile || !profileChanged || !profile.currentPassword">
                <Save class="size-4" /> {{ savingProfile ? "Đang lưu..." : "Lưu thay đổi" }}
              </Button>
            </div>
          </form>
        </template>
      </CardContent>
    </Card>

    <Card class="min-w-0 gap-4">
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>Sử dụng mật khẩu riêng, không trùng với các tài khoản khác.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="changePassword">
          <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[1fr_1fr]">
            <div class="space-y-3">
              <div v-for="field in passwordFields" :key="field.key" class="space-y-1.5">
                <label :for="field.id" class="text-sm font-medium">{{ field.label }}</label>
                <div class="relative">
                  <Input
                    :id="field.id"
                    :model-value="passwords[field.key]"
                    :type="(field.key === 'current' ? showCurrent : field.key === 'next' ? showNew : showConfirm) ? 'text' : 'password'"
                    :autocomplete="field.autocomplete"
                    :disabled="savingPassword || loading || !admin"
                    class="pr-10"
                    required
                    @update:model-value="(value) => passwords[field.key] = String(value ?? '')"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground hover:text-foreground"
                    :aria-label="`Hiện hoặc ẩn ${field.label.toLowerCase()}`"
                    @click="field.key === 'current' ? showCurrent = !showCurrent : field.key === 'next' ? showNew = !showNew : showConfirm = !showConfirm"
                  >
                    <EyeOff v-if="field.key === 'current' ? showCurrent : field.key === 'next' ? showNew : showConfirm" class="size-4" />
                    <Eye v-else class="size-4" />
                  </button>
                </div>
              </div>
            </div>
            <div class="rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground">
              <p class="mb-3 font-medium text-foreground">Độ mạnh mật khẩu · {{ strength }}/4</p>
              <div class="mb-4 grid grid-cols-4 gap-1">
                <div v-for="index in 4" :key="index" class="h-1.5 rounded-full" :class="strength >= index ? 'bg-primary' : 'bg-border'" />
              </div>
              <p v-for="item in strengthChecks" :key="item.label" class="mb-2 flex items-center gap-2" :class="item.ok ? 'text-emerald-600 dark:text-emerald-400' : ''">
                <span aria-hidden="true">{{ item.ok ? '✓' : '○' }}</span>{{ item.label }}
              </p>
            </div>
          </div>
          <p v-if="passwordError" role="alert" class="text-sm text-destructive">{{ passwordError }}</p>
          <div class="flex justify-end">
            <Button type="submit" :disabled="savingPassword || loading || !admin || !passwords.current || !passwords.next || !passwords.confirm">
              <KeyRound class="size-4" /> {{ savingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu" }}
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">Sau khi cập nhật thành công, bạn sẽ được đăng xuất để đăng nhập lại bằng mật khẩu mới.</p>
        </form>
      </CardContent>
    </Card>

    <Card class="border-destructive/40 gap-2">
      <CardContent class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div class="flex items-center gap-3">
          <div class="rounded-lg bg-destructive/10 p-2 text-destructive"><LogOut class="size-5" /></div>
          <div>
            <p class="text-sm font-medium">Đăng xuất phiên hiện tại</p>
            <p class="text-xs text-muted-foreground">Thu hồi phiên đăng nhập trong trình duyệt này.</p>
          </div>
        </div>
        <Button type="button" variant="outline" class="text-destructive" :disabled="loggingOut" @click="signOut">
          {{ loggingOut ? "Đang đăng xuất..." : "Đăng xuất" }}
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
