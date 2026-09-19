import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/composables/useAuth";

import AdminLayout from "@/layouts/AdminLayout.vue";
import DashboardView from "@/views/DashboardView.vue";
import CandidatesView from "@/views/CandidatesView.vue";
import PartnersView from "@/views/PartnersView.vue";
import LoginView from "@/views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/",
      component: AdminLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          path: "dashboard",
          name: "dashboard",
          component: DashboardView,
          meta: {
            title: "Dashboard Vận hành",
            description:
              "Theo dõi đăng ký, thanh toán và tiến độ vận hành cuộc thi Python Master",
          },
          children: [
            {
              path: "",
              redirect: { name: "dashboard-overview" },
            },
            {
              path: "overview",
              name: "dashboard-overview",
              component: () =>
                import("@/views/dashboard/DashboardOverview.vue"),
            },
            {
              path: "regions",
              name: "dashboard-regions",
              component: () =>
                import("@/views/dashboard/DashboardRegions.vue"),
            },
            {
              path: "demographics",
              name: "dashboard-demographics",
              component: () =>
                import("@/views/dashboard/DashboardDemographics.vue"),
            },
            {
              path: "schools",
              name: "dashboard-schools",
              component: () =>
                import("@/views/dashboard/DashboardSchools.vue"),
            },
          ],
        },
        {
          path: "candidates",
          name: "candidates",
          component: CandidatesView,
          meta: {
            title: "Quản lý Thí sinh",
            description:
              "Quản lý hồ sơ dự thi tập trung của cuộc thi Python Master",
          },
        },
        {
          path: "partners",
          name: "partners",
          component: PartnersView,
          meta: {
            title: "Quản lý Đối tác",
            description:
              "Theo dõi hợp tác và tài trợ cho cuộc thi Python Master",
          },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/dashboard",
    },
  ],
});

router.beforeEach((to) => {
  const { isLoggedIn } = useAuth();

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "login" };
  }

  if (to.name === "login" && isLoggedIn.value) {
    return { name: "dashboard-overview" };
  }
});

export default router;
