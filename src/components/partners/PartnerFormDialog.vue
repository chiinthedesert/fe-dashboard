<script setup lang="ts">
import { computed, watch } from "vue";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";

import type { Partner } from "@/types/partner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Props and events
const props = defineProps<{
  open: boolean;
  partner: Partner | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [values: Omit<Partner, "id">];
}>();

// Form validation
const partnerSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên đơn vị."),

  type: z.enum(["Trường học", "Doanh nghiệp", "Khác"]),

  contactName: z.string().trim().min(1, "Vui lòng nhập người liên hệ."),

  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Email không hợp lệ.",
    ),

  phone: z
    .string()
    .trim()
    .regex(
      /^(0[0-9]{9,10})?$/,
      "Số điện thoại phải có 10–11 chữ số và bắt đầu bằng 0.",
    ),

  notes: z.string().trim(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

// Default form values
function getDefaultValues(partner: Partner | null = null): PartnerFormValues {
  return {
    name: partner?.name ?? "",
    type: partner?.type ?? "Trường học",
    contactName: partner?.contactName ?? "",
    email: partner?.email ?? "",
    phone: partner?.phone ?? "",
    notes: partner?.notes ?? "",
  };
}

// Form instance
const form = useForm({
  defaultValues: getDefaultValues(),

  validators: {
    onSubmit: partnerSchema,
  },

  onSubmit: async ({ value }) => {
    const validatedValues = partnerSchema.parse(value);

    emit("submit", validatedValues);
  },
});

// Dialog mode
const isEditing = computed(() => props.partner !== null);

// Populate the form whenever the dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.reset(getDefaultValues(props.partner));
    }
  },
);

// Close dialog
function closeDialog() {
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <!-- Dialog header -->
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? "Chỉnh sửa thông tin" : "Thêm đối tác" }}
        </DialogTitle>

        <DialogDescription>
          {{
            isEditing
              ? "Cập nhật thông tin liên hệ và ghi chú phân loại của đối tác."
              : "Nhập thông tin đơn vị phối hợp cùng cuộc thi."
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- Partner form -->
      <form class="grid gap-4" novalidate @submit.prevent="form.handleSubmit()">
        <!-- Partner name -->
        <form.Field name="name">
          <template #default="{ field }">
            <Field :data-invalid="!field.state.meta.isValid">
              <FieldLabel :for="field.name">
                Tên đối tác / doanh nghiệp
                <span class="text-destructive">*</span>
              </FieldLabel>

              <Input
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :aria-invalid="!field.state.meta.isValid"
                placeholder="Nhập tên đơn vị..."
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

        <!-- Classification and contact name -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Partner type -->
          <form.Field name="type">
            <template #default="{ field }">
              <Field :data-invalid="!field.state.meta.isValid">
                <FieldLabel :for="field.name">
                  Phân loại
                  <span class="text-destructive">*</span>
                </FieldLabel>

                <Select
                  :name="field.name"
                  :model-value="field.state.value"
                  @update:model-value="
                    (value) => field.handleChange(value as Partner['type'])
                  "
                >
                  <SelectTrigger
                    :id="field.name"
                    class="w-full"
                    :aria-invalid="!field.state.meta.isValid"
                  >
                    <SelectValue placeholder="Chọn phân loại" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Trường học"> Trường học </SelectItem>

                    <SelectItem value="Doanh nghiệp"> Doanh nghiệp </SelectItem>

                    <SelectItem value="Khác"> Khác </SelectItem>
                  </SelectContent>
                </Select>

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>

          <!-- Contact name -->
          <form.Field name="contactName">
            <template #default="{ field }">
              <Field :data-invalid="!field.state.meta.isValid">
                <FieldLabel :for="field.name">
                  Người liên hệ
                  <span class="text-destructive">*</span>
                </FieldLabel>

                <Input
                  :id="field.name"
                  :name="field.name"
                  :model-value="field.state.value"
                  :aria-invalid="!field.state.meta.isValid"
                  placeholder="Nhập người liên hệ..."
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
                <FieldLabel :for="field.name">
                  Email
                  <span class="text-destructive">*</span>
                </FieldLabel>

                <Input
                  :id="field.name"
                  :name="field.name"
                  type="email"
                  :model-value="field.state.value"
                  :aria-invalid="!field.state.meta.isValid"
                  placeholder="example@email.com"
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
          <form.Field name="phone">
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

        <!-- Notes -->
        <form.Field name="notes">
          <template #default="{ field }">
            <Field :data-invalid="!field.state.meta.isValid">
              <FieldLabel :for="field.name"> Ghi chú phân loại </FieldLabel>

              <Textarea
                :id="field.name"
                :name="field.name"
                :model-value="field.state.value"
                :aria-invalid="!field.state.meta.isValid"
                placeholder="Nhập ghi chú..."
                class="min-h-24 resize-y"
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

        <!-- Form actions -->
        <DialogFooter class="mt-2">
          <Button type="button" variant="outline" @click="closeDialog">
            Hủy
          </Button>

          <form.Subscribe>
            <template #default="{ isSubmitting }">
              <Button type="submit" :disabled="isSubmitting">
                {{ isEditing ? "Lưu thay đổi" : "Thêm đối tác" }}
              </Button>
            </template>
          </form.Subscribe>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
