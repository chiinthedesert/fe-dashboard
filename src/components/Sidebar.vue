<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Activity,
  UserRound,
  BriefcaseBusiness,
  ShieldUser,
} from "lucide-vue-next";
import sotatekIcon from "@/assets/sotatekIcon.png";

interface Admin {
  name: string;
  department: string;
}

const currentAdmin: Admin = {
  name: "Nguyễn Văn A",
  department: "Phòng vận hành",
};
</script>

<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" class="p-0">
              <div
                class="flex aspect-square size-10 overflow-hidden items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <img
                  :src="sotatekIcon"
                  alt="Python Master"
                  class="size-full object-cover"
                />
              </div>
              <div class="grid flex-1 text-left leading-tight">
                <span class="truncate font-semibold text-lg"
                  >Python Master</span
                >
                <span class="truncate text-xs">HỆ THỐNG VẬN HÀNH</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem class="">
                <SidebarMenuButton as-child>
                  <a href="#">
                    <Activity />
                    <span>Dashboard Vận Hành</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton as-child>
                  <a href="#">
                    <UserRound />
                    <span>Quản Lý Thí Sinh</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton as-child>
                  <a href="#">
                    <BriefcaseBusiness />
                    <span>Quản Lý Đối Tác</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" class="p-0">
              <div
                class="flex aspect-square size-10 overflow-hidden items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <ShieldUser />
              </div>
              <div class="grid flex-1 text-left leading-tight">
                <span class="truncate font-semibold">{{
                  currentAdmin.name
                }}</span>
                <span class="truncate text-xs">{{
                  currentAdmin.department
                }}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="aspect-video rounded-xl bg-muted/50" />
          <div class="aspect-video rounded-xl bg-muted/50" />
          <div class="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div class="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
