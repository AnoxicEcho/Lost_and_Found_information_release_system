<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Back } from "@element-plus/icons-vue";
import http from "../api/http";

const router = useRouter();
const users = ref([]);
const loading = ref(false);

async function fetchUsers() {
  loading.value = true;
  try {
    const { data } = await http.get("/users");
    users.value = data;
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "获取用户失败");
  } finally {
    loading.value = false;
  }
}

async function updateRole(user) {
  try {
    await http.patch(`/users/${user.id}/role`, { role: user.role });
    ElMessage.success("角色更新成功");
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "更新失败");
  }
}

function goBack() {
  router.push("/");
}

onMounted(fetchUsers);
</script>

<template>
  <el-card shadow="never" class="panel table-panel">
    <template #header>
      <div class="list-header">
        <div class="panel-title">用户管理</div>
        <el-button :icon="Back" plain @click="goBack">返回上一级</el-button>
      </div>
    </template>

    <el-table :data="users" border stripe v-loading="loading" class="lf-table">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" min-width="160" />
      <el-table-column label="角色" min-width="140">
        <template #default="{ row }">
          <el-select v-model="row.role" style="width: 120px">
            <el-option label="user" value="user" />
            <el-option label="admin" value="admin" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" min-width="190" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="updateRole(row)">保存</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
