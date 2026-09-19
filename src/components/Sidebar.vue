<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
const { setOpenMobile } = useSidebar();

import { Activity, Users, Handshake, ShieldUser } from "lucide-vue-next";
import sotatekIcon from "@/assets/sotatekIcon.png";

import { RouterLink, useRoute } from "vue-router";
const route = useRoute();

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
              <span class="truncate font-semibold text-lg">Python Master</span>
              <span class="truncate text-xs text-muted-foreground"
                >HỆ THỐNG VẬN HÀNH</span
              >
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as-child
                :is-active="
                  route.name === 'dashboard' ||
                  route.path.startsWith('/dashboard/')
                "
                @click="setOpenMobile(false)"
              >
                <RouterLink to="/dashboard">
                  <Activity />
                  <span>Dashboard Vận Hành</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                as-child
                :is-active="route.name === 'candidates'"
                @click="setOpenMobile(false)"
              >
                <RouterLink to="/candidates">
                  <Users />
                  <span>Quản Lý Thí Sinh</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                as-child
                :is-active="route.name === 'partners'"
                @click="setOpenMobile(false)"
              >
                <RouterLink to="/partners">
                  <Handshake />
                  <span>Quản Lý Đối Tác</span>
                </RouterLink>
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
              <span class="truncate text-xs text-muted-foreground">{{
                currentAdmin.department
              }}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
