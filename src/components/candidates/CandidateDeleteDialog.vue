<script setup lang="ts">
import type { CandidateResponse } from "@/types/candidate-api";

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

const props = defineProps<{
  open: boolean;
  candidate: CandidateResponse | null;
  deleting: boolean;
  error: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
}>();

function updateOpen(value: boolean) {
  if (!props.deleting) {
    emit("update:open", value);
  }
}
</script>

<template>
  <AlertDialog :open="open" @update:open="updateOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle> Xóa thí sinh? </AlertDialogTitle>

        <AlertDialogDescription>
          Bạn có chắc chắn muốn xóa
          <span class="font-semibold text-foreground">
            {{ candidate?.hoTen || "thí sinh này" }}
          </span>
          khỏi danh sách thí sinh? Hành động này không thể hoàn tác.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <p v-if="error" role="alert" class="text-sm text-destructive">
        {{ error }}
      </p>

      <AlertDialogFooter>
        <AlertDialogCancel :disabled="deleting"> Hủy </AlertDialogCancel>

        <AlertDialogAction
          :disabled="deleting"
          class="bg-destructive text-white hover:bg-destructive/90"
          @click.prevent="emit('confirm')"
        >
          {{ deleting ? "Đang xóa..." : "Xóa thí sinh" }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
