<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { Back, User, SwitchButton } from "@element-plus/icons-vue";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const showBack = computed(() => authStore.isLoggedIn && route.path !== "/");

function goUsers() {
  router.push("/users");
}

function goBack() {
  router.back();
}

async function logout() {
  try {
    await ElMessageBox.confirm("确认退出登录吗？", "提示", { type: "warning" });
    authStore.logout();
    router.push("/auth");
  } catch (_error) {
    // 用户取消退出
  }
}
</script>

<template>
  <div class="app-shell">
    <el-header class="topbar">
      <div class="brand-wrap">
        <div class="brand-mark">LF</div>
        <div class="brand-text">
          <div class="brand-title">失物招领信息管理系统</div>
          <div class="brand-subtitle">让每一次找回都有回应</div>
        </div>
      </div>

      <div class="actions" v-if="authStore.isLoggedIn">
        <el-button v-if="showBack" :icon="Back" plain @click="goBack">返回上一级</el-button>
        <el-tag effect="dark" type="info">{{ authStore.user?.username }} / {{ authStore.user?.role }}</el-tag>
        <el-button v-if="authStore.isAdmin" :icon="User" @click="goUsers">用户管理</el-button>
        <el-button type="danger" :icon="SwitchButton" @click="logout">退出登录</el-button>
      </div>
    </el-header>

    <main class="main-wrap">
      <router-view />
    </main>
  </div>
</template>
