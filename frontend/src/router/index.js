import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import AuthView from "../views/AuthView.vue";
import HomeView from "../views/HomeView.vue";
import UserManageView from "../views/UserManageView.vue";

const routes = [
  { path: "/auth", name: "auth", component: AuthView },
  { path: "/", name: "home", component: HomeView, meta: { requiresAuth: true } },
  {
    path: "/users",
    name: "users",
    component: UserManageView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return "/auth";
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return "/";
  }
  if (to.path === "/auth" && authStore.isLoggedIn) {
    return "/";
  }
  return true;
});

export default router;
