<script setup lang="ts">
import { computed, watch } from "vue";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";

import {
  candidateApplicationStatuses,
  candidateDivisions,
  candidatePaymentStatuses,
} from "@/types/candidate";

import type {
  CandidateResponse,
  CreateCandidateRequest,
  StaffOptionResponse,
} from "@/types/candidate-api";

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
  candidate: CandidateResponse | null;
  saving: boolean;
  error: string;
  provinces: string[];
  partners: string[];
  sales: StaffOptionResponse[];
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [values: CreateCandidateRequest];
}>();

const isEditing = computed(() => props.candidate !== null);

const candidateSchema = z.object({
  hoTen: z.string().trim().min(1, "Vui lòng nhập họ và tên."),
  soDienThoai: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "Số điện thoại phải có 10–11 chữ số."),
  email: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Email không hợp lệ.",
    ),
  cccd: z
    .string()
    .trim()
    .regex(/^(\d{12})?$/, "CCCD phải có 12 chữ số."),
  ngaySinh: z
    .string()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Ngày sinh không hợp lệ.",
    ),
  truongHoc: z.string().trim(),
  tinhThanh: z.string().trim(),
  diaChi: z.string().trim(),
  doiTac: z.string().trim(),
  assignedSaleId: z.string(),
  bangDau: z.string(),
  trangThaiHoSo: z.string(),
  paymentStatus: z.string(),
  soTien: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) && Number.isSafeInteger(Number(value))),
      "Số tiền phải là số nguyên không âm.",
    ),
});

function getDefaultValues(candidate: CandidateResponse | null = null) {
  return {
    hoTen: candidate?.hoTen ?? "",
    ngaySinh: candidate?.ngaySinh?.slice(0, 10) ?? "",
    soDienThoai: candidate?.soDienThoai ?? "",
    email: candidate?.email ?? "",
    cccd: candidate?.cccd ?? "",
    truongHoc: candidate?.truongHoc ?? "",
    tinhThanh: candidate?.tinhThanh ?? "",
    diaChi: candidate?.diaChi ?? "",
    doiTac: candidate?.doiTac ?? "",
    assignedSaleId:
      candidate?.assignedSaleId != null ? String(candidate.assignedSaleId) : "",
    bangDau: candidate?.bangDau ?? "Bảng A",
    trangThaiHoSo: candidate?.trangThaiHoSo ?? "created",
    paymentStatus: candidate?.paymentStatus ?? "pending",
    soTien: candidate?.soTien != null ? String(candidate.soTien) : "",
  };
}

const divisionOptions = computed(() => {
  const options = new Set<string>(candidateDivisions);
  if (props.candidate?.bangDau) options.add(props.candidate.bangDau);
  return [...options];
});

const provinceOptions = computed(() => {
  const options = new Set(
    props.provinces.map((value) => value.trim()).filter(Boolean),
  );
  if (props.candidate?.tinhThanh) options.add(props.candidate.tinhThanh);
  return [...options].sort((a, b) => a.localeCompare(b, "vi"));
});

const partnerOptions = computed(() => {
  const options = new Set(
    props.partners.map((value) => value.trim()).filter(Boolean),
  );
  if (props.candidate?.doiTac) options.add(props.candidate.doiTac);
  return [...options].sort((a, b) => a.localeCompare(b, "vi"));
});

const saleOptions = computed(() => {
  const options = [...props.sales];
  const currentId = props.candidate?.assignedSaleId;

  if (
    currentId != null &&
    !options.some((sale) => sale.id === currentId)
  ) {
    options.push({
      id: currentId,
      hoTen: props.candidate?.assignedSaleName ?? `Sale #${currentId}`,
    });
  }

  return options.sort((a, b) =>
    (a.hoTen ?? "").localeCompare(b.hoTen ?? "", "vi"),
  );
});

const applicationOptions = computed(() => {
  const options = [...candidateApplicationStatuses];
  const current = props.candidate?.trangThaiHoSo;

  if (current && !options.some((item) => item.value === current)) {
    return [...options, { value: current, label: current }];
  }

  return options;
});

const paymentOptions = computed(() => {
  const options = [...candidatePaymentStatuses];
  const current = props.candidate?.paymentStatus;

  if (current && !options.some((item) => item.value === current)) {
    return [...options, { value: current, label: current }];
  }

  return options;
});

const form = useForm({
  defaultValues: getDefaultValues(),
  validators: {
    onSubmit: candidateSchema,
  },
  onSubmit: async ({ value }) => {
    if (props.saving) return;

    const values = candidateSchema.parse(value);

    const request: CreateCandidateRequest = {
      hoTen: values.hoTen,
      soDienThoai: values.soDienThoai,
      trangThaiHoSo: values.trangThaiHoSo,
      paymentStatus: values.paymentStatus,
      ...(values.ngaySinh && { ngaySinh: values.ngaySinh }),
      ...(values.email && { email: values.email }),
      ...(values.cccd && { cccd: values.cccd }),
      ...(values.truongHoc && { truongHoc: values.truongHoc }),
      ...(values.tinhThanh && { tinhThanh: values.tinhThanh }),
      ...(values.diaChi && { diaChi: values.diaChi }),
      ...(values.doiTac && { doiTac: values.doiTac }),
      ...(values.assignedSaleId && {
        assignedSaleId: Number(values.assignedSaleId),
      }),
      ...(values.bangDau && { bangDau: values.bangDau }),
      ...(values.soTien !== "" && { soTien: Number(values.soTien) }),
    };

    emit("submit", request);
  },
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) form.reset(getDefaultValues(props.candidate));
  },
);

const personalFields = [
  {
    name: "hoTen",
    label: "Họ và tên",
    placeholder: "Nhập họ và tên",
    type: "text",
    required: true,
  },
  {
    name: "ngaySinh",
    label: "Ngày sinh",
    placeholder: "",
    type: "date",
    required: false,
  },
  {
    name: "soDienThoai",
    label: "Số điện thoại",
    placeholder: "Nhập số điện thoại",
    type: "tel",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "email@example.com",
    type: "email",
    required: false,
  },
  {
    name: "cccd",
    label: "CCCD",
    placeholder: "Số căn cước công dân",
    type: "text",
    required: false,
  },
] as const;

function closeDialog() {
  if (!props.saving) emit("update:open", false);
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="
      (value) => {
        if (!saving) emit('update:open', value);
      }
    "
  >
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          {{ isEditing ? "Chỉnh sửa thí sinh" : "Thêm thí sinh mới" }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEditing
              ? "Cập nhật thông tin hồ sơ thí sinh dự thi Python Master."
              : "Nhập thông tin hồ sơ thí sinh dự thi Python Master."
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="grid gap-5" novalidate @submit.prevent="form.handleSubmit()">
        <section class="grid gap-4">
          <h3 class="text-sm font-semibold">Thông tin cá nhân</h3>

          <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field
              v-for="input in personalFields"
              :key="input.name"
              :name="input.name"
            >
              <template #default="{ field }">
                <Field class="min-w-0" :data-invalid="!field.state.meta.isValid">
                  <FieldLabel :for="`candidate-${field.name}`">
                    {{ input.label }}
                    <span v-if="input.required" class="text-destructive">*</span>
                  </FieldLabel>

                  <Input
                    :id="`candidate-${field.name}`"
                    :name="field.name"
                    :type="input.type"
                    :model-value="field.state.value"
                    :placeholder="input.placeholder"
                    :required="input.required"
                    :disabled="saving"
                    :aria-invalid="!field.state.meta.isValid"
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
          </div>
        </section>

        <div class="border-t" />

        <section class="grid gap-4">
          <h3 class="text-sm font-semibold">Thông tin dự thi</h3>

          <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="truongHoc">
              <template #default="{ field }">
                <Field class="min-w-0">
                  <FieldLabel for="candidate-truongHoc">
                    Trường học / Đơn vị
                  </FieldLabel>
                  <Input
                    id="candidate-truongHoc"
                    :name="field.name"
                    :model-value="field.state.value"
                    placeholder="Nhập trường học"
                    :disabled="saving"
                    class="w-full min-w-0"
                    @update:model-value="
                      (value) => field.handleChange(String(value ?? ''))
                    "
                    @blur="field.handleBlur"
                  />
                </Field>
              </template>
            </form.Field>

            <form.Field name="tinhThanh">
              <template #default="{ field }">
                <Field class="min-w-0">
                  <FieldLabel for="candidate-tinhThanh">
                    Tỉnh / Thành phố
                  </FieldLabel>
                  <Select
                    :model-value="field.state.value || '__none'"
                    :disabled="saving"
                    @update:model-value="
                      (value) =>
                        field.handleChange(
                          value === '__none' ? '' : String(value ?? ''),
                        )
                    "
                  >
                    <SelectTrigger id="candidate-tinhThanh" class="w-full min-w-0">
                      <SelectValue placeholder="Chọn tỉnh / thành" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-if="!isEditing || !candidate?.tinhThanh" value="__none">Chưa chọn</SelectItem>
                      <SelectItem
                        v-for="province in provinceOptions"
                        :key="province"
                        :value="province"
                      >
                        {{ province }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </template>
            </form.Field>

            <form.Field name="doiTac">
              <template #default="{ field }">
                <Field class="min-w-0">
                  <FieldLabel for="candidate-doiTac">Đối tác giới thiệu</FieldLabel>
                  <Select
                    :model-value="field.state.value || '__none'"
                    :disabled="saving"
                    @update:model-value="
                      (value) =>
                        field.handleChange(
                          value === '__none' ? '' : String(value ?? ''),
                        )
                    "
                  >
                    <SelectTrigger id="candidate-doiTac" class="w-full min-w-0">
                      <SelectValue placeholder="Chọn đối tác" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-if="!isEditing || !candidate?.doiTac" value="__none">Không có</SelectItem>
                      <SelectItem
                        v-for="partner in partnerOptions"
                        :key="partner"
                        :value="partner"
                      >
                        {{ partner }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </template>
            </form.Field>

            <form.Field name="assignedSaleId">
              <template #default="{ field }">
                <Field class="min-w-0">
                  <FieldLabel for="candidate-assignedSaleId">
                    Nhân viên Sale phụ trách
                  </FieldLabel>
                  <Select
                    :model-value="field.state.value || '__none'"
                    :disabled="saving"
                    @update:model-value="
                      (value) =>
                        field.handleChange(
                          value === '__none' ? '' : String(value ?? ''),
                        )
                    "
                  >
                    <SelectTrigger
                      id="candidate-assignedSaleId"
                      class="w-full min-w-0"
                    >
                      <SelectValue placeholder="Chọn nhân viên Sale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-if="!isEditing || candidate?.assignedSaleId == null" value="__none">Chưa phân công</SelectItem>
                      <SelectItem
                        v-for="sale in saleOptions"
                        :key="sale.id"
                        :value="String(sale.id)"
                      >
                        {{ sale.hoTen || sale.idNhanVien || `Sale #${sale.id}` }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </template>
            </form.Field>
          </div>

          <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
            <form.Field name="diaChi">
              <template #default="{ field }">
                <Field class="min-w-0 sm:col-span-2">
                  <FieldLabel for="candidate-diaChi">Địa chỉ</FieldLabel>
                  <Input
                    id="candidate-diaChi"
                    :name="field.name"
                    :model-value="field.state.value"
                    placeholder="Nhập địa chỉ"
                    :disabled="saving"
                    class="w-full min-w-0"
                    @update:model-value="
                      (value) => field.handleChange(String(value ?? ''))
                    "
                    @blur="field.handleBlur"
                  />
                </Field>
              </template>
            </form.Field>

            <form.Field name="bangDau">
              <template #default="{ field }">
                <Field class="min-w-0">
                  <FieldLabel for="candidate-bangDau">Bảng đấu</FieldLabel>
                  <Select
                    :model-value="field.state.value || undefined"
                    :disabled="saving"
                    @update:model-value="
                      (value) => field.handleChange(String(value ?? ''))
                    "
                  >
                    <SelectTrigger id="candidate-bangDau" class="w-full min-w-0">
                      <SelectValue placeholder="Chọn bảng" />
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
                </Field>
              </template>
            </form.Field>
          </div>
        </section>

        <div class="border-t" />

        <section class="grid gap-4">
          <h3 class="text-sm font-semibold">Hồ sơ & Thanh toán</h3>

          <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="trangThaiHoSo">
              <template #default="{ field }">
                <Field class="min-w-0">
                  <FieldLabel for="candidate-trangThaiHoSo">
                    Trạng thái hồ sơ
                  </FieldLabel>
                  <Select
                    :model-value="field.state.value"
                    :disabled="saving"
                    @update:model-value="
                      (value) => field.handleChange(String(value ?? ''))
                    "
                  >
                    <SelectTrigger
                      id="candidate-trangThaiHoSo"
                      class="w-full min-w-0"
                    >
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="status in applicationOptions"
                        :key="status.value"
                        :value="status.value"
                      >
                        {{ status.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </template>
            </form.Field>

            <form.Field name="paymentStatus">
              <template #default="{ field }">
                <Field class="min-w-0">
                  <FieldLabel for="candidate-paymentStatus">
                    Trạng thái thanh toán
                  </FieldLabel>
                  <Select
                    :model-value="field.state.value"
                    :disabled="saving"
                    @update:model-value="
                      (value) => field.handleChange(String(value ?? ''))
                    "
                  >
                    <SelectTrigger
                      id="candidate-paymentStatus"
                      class="w-full min-w-0"
                    >
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="status in paymentOptions"
                        :key="status.value"
                        :value="status.value"
                      >
                        {{ status.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </template>
            </form.Field>

            <Field class="min-w-0">
              <FieldLabel for="candidate-trangThai">Trạng thái thí sinh</FieldLabel>
              <Input
                id="candidate-trangThai"
                :model-value="
                  candidate?.trangThai ?? 'Hệ thống tự xác định sau khi tạo'
                "
                disabled
                class="w-full min-w-0"
              />
            </Field>

            <form.Field name="soTien">
              <template #default="{ field }">
                <Field class="min-w-0" :data-invalid="!field.state.meta.isValid">
                  <FieldLabel for="candidate-soTien">Số tiền (VNĐ)</FieldLabel>
                  <Input
                    id="candidate-soTien"
                    :name="field.name"
                    type="number"
                    min="0"
                    step="1"
                    :model-value="field.state.value"
                    placeholder="Nhập số tiền"
                    :disabled="saving"
                    :aria-invalid="!field.state.meta.isValid"
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
          </div>
        </section>

        <p v-if="error" role="alert" class="text-sm text-destructive">
          {{ error }}
        </p>

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
                      : "Lưu thí sinh"
                }}
              </Button>
            </template>
          </form.Subscribe>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
