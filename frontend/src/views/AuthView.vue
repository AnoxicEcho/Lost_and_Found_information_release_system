<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import http from "../api/http";
import { useAuthStore } from "../stores/auth";

const mode = ref("login");
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: "",
  password: ""
});

async function submit() {
  if (!form.username || !form.password) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }

  loading.value = true;
  try {
    const api = mode.value === "login" ? "/auth/login" : "/auth/register";
    const { data } = await http.post(api, form);
    authStore.setAuth(data.token, data.user);
    ElMessage.success(mode.value === "login" ? "登录成功" : "注册成功");
    router.push("/");
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "请求失败，请稍后重试");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <el-card class="auth-card" shadow="hover">
      <div class="auth-title">{{ mode === "login" ? "用户登录" : "用户注册" }}</div>

      <el-form :model="form" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="submit">
            {{ mode === "login" ? "登录" : "注册" }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-button link @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === "login" ? "没有账号？去注册" : "已有账号？去登录" }}
      </el-button>
      <el-alert title="默认管理员账号：admin / admin123" type="info" :closable="false" />
    </el-card>
  </div>
</template>
