<script setup>
import { reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import http from "../api/http";

const props = defineProps({
  mode: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["submit"]);

const formRef = ref(null);
const imageFileList = ref([]);

const form = reactive({
  title: "",
  category: "",
  description: "",
  location: "",
  date: "",
  contact: "",
  image_urls: []
});

const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  category: [{ required: true, message: "请输入类别", trigger: "blur" }],
  description: [{ required: true, message: "请输入详细描述", trigger: "blur" }],
  location: [{ required: true, message: "请输入地点", trigger: "blur" }],
  date: [{ required: true, message: "请选择时间", trigger: "change" }],
  contact: [{ required: true, message: "请输入联系方式", trigger: "blur" }]
};

function resetForm() {
  form.title = "";
  form.category = "";
  form.description = "";
  form.location = "";
  form.date = "";
  form.contact = "";
  form.image_urls = [];
  imageFileList.value = [];
}

watch(
  () => props.mode,
  () => resetForm()
);

async function handleUpload({ file, onError, onSuccess }) {
  try {
    const data = new FormData();
    data.append("image", file);
    const response = await http.post("/upload/image", data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    const url = response.data.url;
    form.image_urls = [...form.image_urls, url];
    onSuccess(response.data);
  } catch (error) {
    onError(error);
    ElMessage.error(error.response?.data?.message || "图片上传失败");
  }
}

function handleRemove(_file, fileList) {
  form.image_urls = fileList.map((item) => item.response?.url || item.url).filter(Boolean);
}

function handleExceed() {
  ElMessage.warning("最多上传 5 张图片");
}

async function onSubmit() {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    return;
  }
  emit("submit", { ...form });
  resetForm();
}
</script>

<template>
  <el-card shadow="never" class="panel form-panel">
    <template #header>
      <div class="panel-title">{{ mode === "lost" ? "发布失物信息" : "发布招领信息" }}</div>
    </template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="item-form">
      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="如：黑色钱包" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="类别" prop="category">
            <el-input v-model="form.category" placeholder="如：证件、电子设备" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item label="地点" prop="location">
            <el-input v-model="form.location" placeholder="如：图书馆三楼" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="联系方式" prop="contact">
            <el-input v-model="form.contact" placeholder="手机号 / 微信号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :md="12">
          <el-form-item :label="mode === 'lost' ? '遗失时间' : '拾获时间'" prop="date">
            <el-date-picker
              v-model="form.date"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择精确时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="详细描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="描述颜色、品牌、外观特征等"
        />
      </el-form-item>

      <el-form-item label="上传图片">
        <el-upload
          v-model:file-list="imageFileList"
          list-type="picture-card"
          :http-request="handleUpload"
          :limit="5"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
          accept="image/png,image/jpeg,image/webp,image/gif"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" class="submit-btn" @click="onSubmit">
          {{ mode === "lost" ? "发布失物信息" : "发布招领信息" }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
