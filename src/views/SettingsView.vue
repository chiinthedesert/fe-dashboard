<script setup lang="ts">
import { ref } from "vue";
import { UserRound, Bell, ShieldCheck } from "lucide-vue-next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSettings from "@/components/settings/AccountSettings.vue";
import NotificationSettings from "@/components/settings/NotificationSettings.vue";
import SecuritySettings from "@/components/settings/SecuritySettings.vue";

const activeTab = ref("account");
</script>

<template>
  <section class="mx-auto w-full min-w-0 max-w-4xl">
    <Tabs v-model="activeTab" class="min-w-0 gap-4">
      <div class="min-w-0 overflow-x-auto">
        <TabsList class="w-max max-w-none">
          <TabsTrigger value="account">
            <UserRound class="size-4" />
            Quản lý tài khoản
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell class="size-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck class="size-4" />
            Bảo mật và hệ thống
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  </section>
</template>
