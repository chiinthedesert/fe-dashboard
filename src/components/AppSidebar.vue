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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Users,
  Handshake,
  ShieldUser,
  LogOut,
  ChevronsUpDown,
} from "lucide-vue-next";
import sotatekIcon from "@/assets/sotatekIcon.png";
const { setOpenMobile } = useSidebar();

import { useAuth } from "@/composables/useAuth";

import { RouterLink, useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

import { logout as logoutApi } from "@/services/auth";
const { currentAdmin, accessToken, clearSession } = useAuth();

async function handleLogout() {
  const token = accessToken.value;

  try {
    if (token) {
      await logoutApi(token);
    }
  } catch (error) {
    console.error("Backend logout failed:", error);
  } finally {
    clearSession();
    setOpenMobile(false);
    await router.replace("/login");
  }
}
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
                :is-active="route.path.startsWith('/dashboard/')"
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
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg" class="p-0">
                <div
                  class="flex aspect-square size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <ShieldUser />
                </div>

                <div class="grid min-w-0 flex-1 text-left leading-tight">
                  <span class="truncate font-semibold">
                    {{ currentAdmin?.hoTen?.trim() || currentAdmin?.username }}
                  </span>

                  <span class="truncate text-xs text-muted-foreground">
                    Quản trị viên
                  </span>
                </div>

                <ChevronsUpDown class="ml-auto size-6 shrink-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="start"
              :side-offset="8"
              class="w-(--reka-dropdown-menu-trigger-width)"
            >
              <DropdownMenuItem @select="handleLogout">
                <LogOut class="size-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
