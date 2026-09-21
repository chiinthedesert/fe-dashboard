<script setup lang="ts">
import { computed, watch } from "vue";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";

import {
  candidateDivisions,
  candidateStatuses,
  type Candidate,
  type CandidateFormValues,
} from "@/types/candidate";

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

const props = defineProps<{
  open: boolean;
  candidate: Candidate | null;
  salesPeople: { id: string; name: string }[];
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [values: CandidateFormValues];
}>();

// Validation
const candidateSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ và tên."),

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
    .min(1, "Vui lòng nhập số điện thoại.")
    .regex(
      /^(0[0-9]{9,10})?$/,
      "Số điện thoại phải có 10–11 chữ số và bắt đầu bằng 0.",
    ),

  citizenId: z
    .string()
    .trim()
    .regex(/^(\d{12})?$/, "CCCD phải có 12 chữ số."),

  school: z.string().trim().min(1, "Vui lòng nhập trường hoặc đơn vị."),

  division: z.string().trim().min(1, "Vui lòng chọn bảng đấu."),

  salesPersonId: z.string(),

  status: z.enum(candidateStatuses),
});

function getDefaultValues(
  candidate: Candidate | null = null,
): CandidateFormValues {
  return {
    name: candidate?.name ?? "",
    email: candidate?.email ?? "",
    phone: candidate?.phone ?? "",
    citizenId: candidate?.citizenId ?? "",
    school: candidate?.school ?? "",
    division: candidate?.division ?? candidateDivisions[0] ?? "",
    salesPersonId: candidate?.salesPersonId ?? "",
    status: candidate?.status ?? "Chờ hồ sơ",
  };
}

const form = useForm({
  defaultValues: getDefaultValues(),

  validators: {
    onSubmit: candidateSchema,
  },

  onSubmit: async ({ value }) => {
    emit("submit", candidateSchema.parse(value));
  },
});

const isEditing = computed(() => props.candidate !== null);

// Preserve an existing division even if it is not yet in the option list.
const divisionOptions = computed(() => {
  const options = new Set(candidateDivisions);

  if (props.candidate?.division) {
    options.add(props.candidate.division);
  }

  return [...options];
});

const textFields = [
  {
    name: "name",
    label: "Họ và tên",
    placeholder: "Nguyễn Văn A",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "email@example.com",
    type: "email",
    required: true,
  },
  {
    name: "phone",
    label: "Số điện thoại",
    placeholder: "Nhập số điện thoại...",
    type: "tel",
    required: true,
  },
  {
    name: "citizenId",
    label: "CCCD",
    placeholder: "Số căn cước công dân",
    type: "text",
    required: false,
  },
  {
    name: "school",
    label: "Trường / Đơn vị",
    placeholder: "Nhập trường học hoặc đơn vị...",
    type: "text",
    required: true,
  },
] as const;

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.reset(getDefaultValues(props.candidate));
    }
  },
  { immediate: true },
);

function closeDialog() {
  emit("update:open", false);
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? "Chỉnh sửa thí sinh" : "Thêm thí sinh mới" }}
        </DialogTitle>

        <DialogDescription>
          {{
            isEditing
              ? "Cập nhật thông tin hồ sơ thí sinh dự thi Python Master."
              : "Điền thông tin hồ sơ thí sinh dự thi Python Master."
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="form.handleSubmit()">
        <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Name, email, phone, CCCD and school -->
          <form.Field
            v-for="input in textFields"
            :key="input.name"
            :name="input.name"
          >
            <template #default="{ field }">
              <Field
                class="min-w-0"
                :class="{ 'sm:col-span-2': input.name === 'name' }"
                :data-invalid="!field.state.meta.isValid"
              >
                <FieldLabel :for="`candidate-${field.name}`">
                  {{ input.label }}
                  <span v-if="input.required" class="text-destructive">
                    *
                  </span>
                </FieldLabel>

                <Input
                  :id="`candidate-${field.name}`"
                  :name="field.name"
                  :type="input.type"
                  :inputmode="
                    input.name === 'citizenId'
                      ? 'numeric'
                      : input.name === 'phone'
                        ? 'tel'
                        : input.name === 'email'
                          ? 'email'
                          : 'text'
                  "
                  :model-value="field.state.value"
                  :aria-invalid="!field.state.meta.isValid"
                  :placeholder="input.placeholder"
                  :required="input.required"
                  class="w-full min-w-0"
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

          <!-- Division -->
          <form.Field name="division">
            <template #default="{ field }">
              <Field class="min-w-0" :data-invalid="!field.state.meta.isValid">
                <FieldLabel for="candidate-division">
                  Bảng đấu
                  <span class="text-destructive">*</span>
                </FieldLabel>

                <Select
                  :name="field.name"
                  :model-value="field.state.value"
                  @update:model-value="
                    (value) => field.handleChange(String(value ?? ''))
                  "
                >
                  <SelectTrigger
                    id="candidate-division"
                    class="w-full min-w-0"
                    :aria-invalid="!field.state.meta.isValid"
                    @blur="field.handleBlur"
                  >
                    <SelectValue placeholder="Chọn bảng đấu" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem
                      v-for="division in divisionOptions"
                      :key="division"
                      :value="division"
                    >
                      {{ division }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>

          <!-- Assigned salesperson -->
          <form.Field name="salesPersonId">
            <template #default="{ field }">
              <Field class="min-w-0" :data-invalid="!field.state.meta.isValid">
                <FieldLabel for="candidate-sales-person">
                  Sale phụ trách
                </FieldLabel>

                <Select
                  :name="field.name"
                  :model-value="field.state.value || 'unassigned'"
                  @update:model-value="
                    (value) =>
                      field.handleChange(
                        value === 'unassigned' ? '' : String(value ?? ''),
                      )
                  "
                >
                  <SelectTrigger
                    id="candidate-sales-person"
                    class="w-full min-w-0"
                    :aria-invalid="!field.state.meta.isValid"
                    @blur="field.handleBlur"
                  >
                    <SelectValue placeholder="Chọn người phụ trách" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="unassigned"> Chưa phân công </SelectItem>

                    <SelectItem
                      v-for="person in salesPeople"
                      :key="person.id"
                      :value="person.id"
                    >
                      {{ person.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>

          <!-- Status -->
          <form.Field name="status">
            <template #default="{ field }">
              <Field class="min-w-0" :data-invalid="!field.state.meta.isValid">
                <FieldLabel for="candidate-status">
                  Trạng thái hồ sơ
                  <span class="text-destructive">*</span>
                </FieldLabel>

                <Select
                  :name="field.name"
                  :model-value="field.state.value"
                  @update:model-value="
                    (value) => field.handleChange(value as Candidate['status'])
                  "
                >
                  <SelectTrigger
                    id="candidate-status"
                    class="w-full min-w-0"
                    :aria-invalid="!field.state.meta.isValid"
                    @blur="field.handleBlur"
                  >
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem
                      v-for="status in candidateStatuses"
                      :key="status"
                      :value="status"
                    >
                      {{ status }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldError
                  v-if="field.state.meta.errors.length"
                  :errors="field.state.meta.errors"
                />
              </Field>
            </template>
          </form.Field>
        </div>

        <DialogFooter class="mt-2">
          <Button type="button" variant="outline" @click="closeDialog">
            Hủy
          </Button>

          <form.Subscribe>
            <template #default="{ isSubmitting }">
              <Button type="submit" :disabled="isSubmitting">
                {{ isEditing ? "Lưu thay đổi" : "Lưu thí sinh" }}
              </Button>
            </template>
          </form.Subscribe>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
