<script setup lang="ts">
import type { Partner } from "@/types/partner";

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
defineProps<{
  open: boolean;
  partner: Partner | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
}>();
</script>

<template>
  <AlertDialog :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogContent>
      <!-- Dialog header -->
      <AlertDialogHeader>
        <AlertDialogTitle> Xóa đối tác? </AlertDialogTitle>

        <AlertDialogDescription>
          Bạn có chắc chắn muốn xóa
          <span class="font-semibold text-foreground">
            {{ partner?.name }}
          </span>
          khỏi danh sách đối tác? Hành động này không thể hoàn tác.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <!-- Dialog actions -->
      <AlertDialogFooter>
        <AlertDialogCancel> Hủy </AlertDialogCancel>

        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          @click="emit('confirm')"
        >
          Xóa đối tác
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
