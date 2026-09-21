<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/composables/useAuth";
import { login } from "@/services/auth";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const router = useRouter();
const { startSession } = useAuth();

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

async function handleSubmit() {
  if (isSubmitting.value) return;

  errorMessage.value = "";
  isSubmitting.value = true;

  try {
    const authSession = await login({
      username: username.value.trim(),
      password: password.value,
    });

    startSession(authSession);

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
              <FieldLabel for="username"> Tên đăng nhập </FieldLabel>

              <Input
                id="username"
                v-model="username"
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                autocomplete="username"
                required
              />
            </Field>

            <Field>
              <FieldLabel for="password"> Mật khẩu </FieldLabel>

              <Input
                id="password"
                v-model="password"
                type="password"
                name="password"
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
