<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

import { useAuth } from "@/composables/useAuth";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/services/auth";

const router = useRouter();

const { startSession } = useAuth();

const email = ref("admin@example.com");
const password = ref("admin123");
const errorMessage = ref("");
const isSubmitting = ref(false);

async function handleSubmit() {
  if (isSubmitting.value) return;

  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    const admin = await login({
      email: email.value,
      password: password.value,
    });

    startSession(admin);

    await router.replace("/dashboard");
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Không thể đăng nhập. Vui lòng thử lại.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>Đăng nhập tài khoản Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <FieldGroup>
            <Field>
              <FieldLabel for="email"> Email </FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="admin@example.com"
                autocomplete="username"
                required
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">Mật khẩu</FieldLabel>
                <a
                  href="#"
                  class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >Quên mật khẩu</a
                >
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
              />
            </Field>
            <Field>
              <p
                v-if="errorMessage"
                role="alert"
                class="text-sm text-destructive"
              >
                {{ errorMessage }}
              </p>

              <Button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? "Đang đăng nhập..." : "Đăng nhập" }}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
