<script setup lang="ts">
import { computed, watch } from "vue";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";

import type { PartnerResponse, PartnerFormValues } from "@/types/partner-api";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { Input } from "@/components/ui/input";

// Props and events

const props = defineProps<{
  open: boolean;
  partner: PartnerResponse | null;
  saving: boolean;
  error: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [values: PartnerFormValues];
}>();

// Dialog mode

const isEditing = computed(() => props.partner !== null);

// Form validation

const partnerSchema = z
  .object({
    tenDoanhNghiep: z.string().trim().min(1, "Vui lòng nhập tên đối tác."),

    maSoThue: z.string().trim(),

    nguoiDaiDien: z.string().trim(),

    email: z
      .string()
      .trim()
      .refine(
        (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        "Email không hợp lệ.",
      ),

    soDienThoai: z
      .string()
      .trim()
      .refine(
        (value) => !value || /^\+?[0-9 .()-]{8,20}$/.test(value),
        "Số điện thoại không hợp lệ.",
      ),

    diaChi: z.string().trim(),

    nganhNghe: z.string().trim(),
  })
  .superRefine((values, context) => {
    if (!props.partner && !values.maSoThue) {
      context.addIssue({
        code: "custom",
        path: ["maSoThue"],
        message: "Vui lòng nhập mã số thuế.",
      });
    }
  });

// Default form values

function getDefaultValues(
  partner: PartnerResponse | null = null,
): PartnerFormValues {
  return {
    tenDoanhNghiep: partner?.tenDoanhNghiep ?? "",
    maSoThue: partner?.maSoThue ?? "",
    nguoiDaiDien: partner?.nguoiDaiDien ?? "",
    email: partner?.email ?? "",
    soDienThoai: partner?.soDienThoai ?? "",
    diaChi: partner?.diaChi ?? "",
    nganhNghe: "",
  };
}

// Form instance

const form = useForm({
  defaultValues: getDefaultValues(),

  validators: {
    onSubmit: partnerSchema,
  },

  onSubmit: async ({ value }) => {
    if (props.saving) return;

    const values = partnerSchema.parse(value);

    emit("submit", values);
  },
});

// Reset form

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.reset(getDefaultValues(props.partner));
    }
  },
);

// Dialog actions

function updateOpen(value: boolean) {
  if (!props.saving) {
    emit("update:open", value);
  }
}

function closeDialog() {
  updateOpen(false);
}
</script>

<template>
  <Dialog :open="open" @update:open="updateOpen">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <!-- Dialog header -->

      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? "Chỉnh sửa thông tin đối tác" : "Thêm đối tác" }}
        </DialogTitle>

        <DialogDescription>
          {{
            isEditing
              ? "Cập nhật thông tin đối tác và người liên hệ."
              : "Nhập thông tin đơn vị phối hợp cùng cuộc thi."
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- Partner form -->

      <form class="grid gap-4" novalidate @submit.prevent="form.handleSubmit()">
        <!-- Partner name -->

        <form.Field name="tenDoanhNghiep">
          <template #default="{ field }">
            <Field :data-invalid="!field.state.meta.isValid">
              <FieldLabel :for="field.name">
                Tên đối tác
                <span class="text-destructive">*</span>
              </FieldLabel>

              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :aria-invalid="!field.state.meta.isValid"
                placeholder="Nhập tên đối tác..."
                :disabled="saving"
                @update:model-value="
                  (value) => field.handleChange(String(value ?? ''))
                "
                @blur="field.handleBlur"
              />

              <FieldError
                v-if="field.state.meta.errors.length"
                :errors="field.state.meta.errors"
              />
            </Field>
          </template>
        </form.Field>

        <!-- Tax ID and representative -->

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Tax ID -->

          <form.Field name="maSoThue">
            <template #default="{ field }">
              <Field :data-invalid="!field.state.meta.isValid">
                <FieldLabel :for="field.name">
                  Mã số thuế

                  <span v-if="!isEditing" class="text-destructive"> * </span>
                </FieldLabel>

                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :aria-invalid="!field.state.meta.isValid"
                  placeholder="Nhập mã số thuế..."
                  :readonly="isEditing"
                  :disabled="saving"
                  @update:model-value="
                    (value) => field.handleChange(String(value ?? ''))
                  "
                  @blur="field.handleBlur"
                />

                <p v-if="isEditing" class="text-xs text-muted-foreground">
                  Mã số thuế không hỗ trợ chỉnh sửa.
                </p>

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>

          <!-- Representative -->

          <form.Field name="nguoiDaiDien">
            <template #default="{ field }">
              <Field :data-invalid="!field.state.meta.isValid">
                <FieldLabel :for="field.name"> Người đại diện </FieldLabel>

                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :aria-invalid="!field.state.meta.isValid"
                  placeholder="Nhập người đại diện..."
                  :disabled="saving"
                  @update:model-value="
                    (value) => field.handleChange(String(value ?? ''))
                  "
                  @blur="field.handleBlur"
                />

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>
        </div>

        <!-- Email and phone -->

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Email -->

          <form.Field name="email">
            <template #default="{ field }">
              <Field :data-invalid="!field.state.meta.isValid">
                <FieldLabel :for="field.name"> Email </FieldLabel>

                <Input
                  :id="field.name"
                  :name="field.name"
                  type="email"
                  :model-value="field.state.value"
                  :aria-invalid="!field.state.meta.isValid"
                  placeholder="example@email.com"
                  :disabled="saving"
                  @update:model-value="
                    (value) => field.handleChange(String(value ?? ''))
                  "
                  @blur="field.handleBlur"
                />

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>

          <!-- Phone -->

          <form.Field name="soDienThoai">
            <template #default="{ field }">
              <Field :data-invalid="!field.state.meta.isValid">
                <FieldLabel :for="field.name"> Số điện thoại </FieldLabel>

                <Input
                  :id="field.name"
                  :name="field.name"
                  type="tel"
                  inputmode="tel"
                  :model-value="field.state.value"
                  :aria-invalid="!field.state.meta.isValid"
                  placeholder="Nhập số điện thoại..."
                  :disabled="saving"
                  @update:model-value="
                    (value) => field.handleChange(String(value ?? ''))
                  "
                  @blur="field.handleBlur"
                />

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>
        </div>

        <!-- Address -->

        <form.Field name="diaChi">
          <template #default="{ field }">
            <Field :data-invalid="!field.state.meta.isValid">
              <FieldLabel :for="field.name"> Địa chỉ </FieldLabel>

              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :aria-invalid="!field.state.meta.isValid"
                placeholder="Nhập địa chỉ..."
                :disabled="saving"
                @update:model-value="
                  (value) => field.handleChange(String(value ?? ''))
                "
                @blur="field.handleBlur"
              />

              <FieldError
                v-if="field.state.meta.errors.length"
                :errors="field.state.meta.errors"
              />
            </Field>
          </template>
        </form.Field>

        <!-- Industry -->

        <form.Field name="nganhNghe">
          <template #default="{ field }">
            <Field :data-invalid="!field.state.meta.isValid">
              <FieldLabel :for="field.name"> Ngành nghề </FieldLabel>

              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :aria-invalid="!field.state.meta.isValid"
                :placeholder="
                  isEditing
                    ? 'Chỉ nhập khi muốn cập nhật'
                    : 'Nhập ngành nghề...'
                "
                :disabled="saving"
                @update:model-value="
                  (value) => field.handleChange(String(value ?? ''))
                "
                @blur="field.handleBlur"
              />

              <p v-if="isEditing" class="text-xs text-muted-foreground">
                Thông tin ngành nghề hiện tại chưa có trong API phản hồi. Để
                trống nếu không muốn cập nhật.
              </p>

              <FieldError
                v-if="field.state.meta.errors.length"
                :errors="field.state.meta.errors"
              />
            </Field>
          </template>
        </form.Field>

        <!-- API error -->

        <p v-if="error" role="alert" class="text-sm text-destructive">
          {{ error }}
        </p>

        <!-- Form actions -->

        <DialogFooter class="mt-2">
          <Button
            type="button"
            variant="outline"
            :disabled="saving"
            @click="closeDialog"
          >
            Hủy
          </Button>

          <form.Subscribe>
            <template #default="{ isSubmitting }">
              <Button type="submit" :disabled="saving || isSubmitting">
                {{
                  saving
                    ? "Đang lưu..."
                    : isEditing
                      ? "Lưu thay đổi"
                      : "Thêm đối tác"
                }}
              </Button>
            </template>
          </form.Subscribe>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
