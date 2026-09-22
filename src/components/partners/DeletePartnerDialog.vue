<script setup lang="ts">
import type { PartnerResponse } from "@/types/partner-api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Props and events

const props = defineProps<{
  open: boolean;
  partner: PartnerResponse | null;
  deleting: boolean;
  error: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
}>();

// Dialog actions

function updateOpen(value: boolean) {
  if (!props.deleting) {
    emit("update:open", value);
  }
}
</script>

<template>
  <AlertDialog :open="open" @update:open="updateOpen">
    <AlertDialogContent>
      <!-- Dialog header -->

      <AlertDialogHeader>
        <AlertDialogTitle> Xóa đối tác? </AlertDialogTitle>

        <AlertDialogDescription>
          Bạn có chắc chắn muốn xóa

          <span class="font-semibold text-foreground">
            {{ partner?.tenDoanhNghiep }}
          </span>

          khỏi danh sách đối tác? Hành động này không thể hoàn tác.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <!-- API error -->

      <p v-if="error" role="alert" class="text-sm text-destructive">
        {{ error }}
      </p>

      <!-- Dialog actions -->

      <AlertDialogFooter>
        <AlertDialogCancel :disabled="deleting"> Hủy </AlertDialogCancel>

        <AlertDialogAction
          :disabled="deleting"
          class="bg-destructive text-white hover:bg-destructive/90"
          @click.prevent="emit('confirm')"
        >
          {{ deleting ? "Đang xóa..." : "Xóa đối tác" }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
