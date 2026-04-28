<script setup>
defineProps({
  mode: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  editableStatus: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update-status"]);

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

function onStatusChange(row, status) {
  emit("update-status", { id: row.id, status });
}
</script>

<template>
  <el-card shadow="never" class="panel table-panel">
    <template #header>
      <div class="panel-title">{{ mode === "lost" ? "失物信息列表" : "招领信息列表" }}</div>
    </template>

    <el-table :data="items" border stripe class="lf-table">
      <el-table-column prop="title" label="标题" min-width="140" />
      <el-table-column prop="category" label="类别" min-width="110" />
      <el-table-column prop="location" label="地点" min-width="140" />
      <el-table-column :label="mode === 'lost' ? '遗失时间' : '拾获时间'" min-width="190">
        <template #default="{ row }">
          {{ formatDateTime(mode === "lost" ? row.lost_date : row.found_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="contact" label="联系方式" min-width="130" />
      <el-table-column prop="username" label="发布用户" min-width="100" />
      <el-table-column label="状态" min-width="150">
        <template #default="{ row }">
          <el-select
            v-if="editableStatus"
            :model-value="row.status"
            size="small"
            style="width: 116px"
            @change="(val) => onStatusChange(row, val)"
          >
            <el-option label="open" value="open" />
            <el-option label="closed" value="closed" />
          </el-select>
          <el-tag v-else :type="row.status === 'closed' ? 'success' : 'warning'" effect="light">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图片" min-width="140">
        <template #default="{ row }">
          <el-image
            v-if="row.image_urls && row.image_urls.length"
            :src="row.image_urls[0]"
            :preview-src-list="row.image_urls"
            :preview-teleported="true"
            :z-index="4000"
            fit="cover"
            style="width: 64px; height: 64px; border-radius: 8px"
          />
          <span class="text-muted" v-else>无</span>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无信息" />
      </template>
    </el-table>
  </el-card>
</template>
