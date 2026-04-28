<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import http from "../api/http";
import { useAuthStore } from "../stores/auth";
import ItemForm from "../components/ItemForm.vue";
import ItemTable from "../components/ItemTable.vue";

const authStore = useAuthStore();
const tab = ref("lost");
const loading = ref(false);

const filters = reactive({
  keyword: "",
  category: "",
  status: ""
});

const lostItems = ref([]);
const foundItems = ref([]);

const totalCount = computed(() => lostItems.value.length + foundItems.value.length);
const processingCount = computed(
  () =>
    lostItems.value.filter((item) => item.status === "open").length +
    foundItems.value.filter((item) => item.status === "open").length
);
const closedCount = computed(
  () =>
    lostItems.value.filter((item) => item.status === "closed").length +
    foundItems.value.filter((item) => item.status === "closed").length
);

function currentItemsRef() {
  return tab.value === "lost" ? lostItems : foundItems;
}

async function queryItems() {
  loading.value = true;
  try {
    const endpoint = tab.value === "lost" ? "/lost-items" : "/found-items";
    const { data } = await http.get(endpoint, { params: filters });
    currentItemsRef().value = data;
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "查询失败");
  } finally {
    loading.value = false;
  }
}

async function queryBothLists() {
  loading.value = true;
  try {
    const [lost, found] = await Promise.all([
      http.get("/lost-items", { params: filters }),
      http.get("/found-items", { params: filters })
    ]);
    lostItems.value = lost.data;
    foundItems.value = found.data;
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "查询失败");
  } finally {
    loading.value = false;
  }
}

async function publishItem(form) {
  try {
    const payload =
      tab.value === "lost"
        ? {
            title: form.title,
            category: form.category,
            description: form.description,
            location: form.location,
            lost_date: form.date,
            contact: form.contact,
            image_urls: form.image_urls
          }
        : {
            title: form.title,
            category: form.category,
            description: form.description,
            location: form.location,
            found_date: form.date,
            contact: form.contact,
            image_urls: form.image_urls
          };

    const endpoint = tab.value === "lost" ? "/lost-items" : "/found-items";
    await http.post(endpoint, payload);
    ElMessage.success(tab.value === "lost" ? "失物信息发布成功" : "招领信息发布成功");
    await queryBothLists();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "发布失败");
  }
}

async function updateStatus({ id, status }) {
  try {
    const endpoint = tab.value === "lost" ? `/lost-items/${id}/status` : `/found-items/${id}/status`;
    await http.patch(endpoint, { status });
    ElMessage.success("状态更新成功");
    await queryBothLists();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "状态更新失败");
    await queryItems();
  }
}

function onTabChange() {
  queryItems();
}

onMounted(queryBothLists);
</script>

<template>
  <div class="home-page">
    <el-row :gutter="12" class="summary-grid">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-label">总信息数</div>
          <div class="summary-value">{{ totalCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="summary-card summary-card-warning">
          <div class="summary-label">处理中</div>
          <div class="summary-value">{{ processingCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="summary-card summary-card-success">
          <div class="summary-label">已结束</div>
          <div class="summary-value">{{ closedCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="panel">
      <template #header>
        <div class="panel-title">信息检索</div>
      </template>

      <el-form :model="filters" inline class="query-form">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="标题 / 描述" clearable />
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="filters.category" placeholder="如：证件、电子设备" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="open" value="open" />
            <el-option label="closed" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="queryBothLists">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-tabs v-model="tab" class="tabs-panel" @tab-change="onTabChange">
      <el-tab-pane name="lost" label="失物信息">
        <ItemForm mode="lost" @submit="publishItem" />
        <el-skeleton :loading="loading" animated>
          <ItemTable
            mode="lost"
            :items="lostItems"
            :editable-status="authStore.isAdmin"
            @update-status="updateStatus"
          />
        </el-skeleton>
      </el-tab-pane>
      <el-tab-pane name="found" label="招领信息">
        <ItemForm mode="found" @submit="publishItem" />
        <el-skeleton :loading="loading" animated>
          <ItemTable
            mode="found"
            :items="foundItems"
            :editable-status="authStore.isAdmin"
            @update-status="updateStatus"
          />
        </el-skeleton>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
