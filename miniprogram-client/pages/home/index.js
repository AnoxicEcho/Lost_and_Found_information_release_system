const { request, toAbsoluteImageUrl } = require("../../utils/request");

Page({
  data: {
    mode: "lost",
    list: [],
    filters: {
      keyword: "",
      category: ""
    },
    isAdmin: false,
    statusOptions: [
      { label: "处理中", value: "open" },
      { label: "已结束", value: "closed" }
    ]
  },
  onShow() {
    const token = wx.getStorageSync("lf_token");
    if (!token) {
      wx.navigateTo({ url: "/pages/auth/index" });
      return;
    }
    const user = wx.getStorageSync("lf_user");
    this.setData({ isAdmin: user?.role === "admin" });
    this.loadList();
  },
  switchMode(e) {
    this.setData({
      mode: e.currentTarget.dataset.mode
    });
    this.loadList();
  },
  onFilterInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [`filters.${key}`]: e.detail.value
    });
  },
  async loadList() {
    try {
      const api = this.data.mode === "lost" ? "/lost-items" : "/found-items";
      const data = await request(api, "GET", this.data.filters);
      const list = (data || []).map((item) => {
        const rawUrls = Array.isArray(item.image_urls) ? item.image_urls : [];
        const imageUrls = rawUrls.map((u) => toAbsoluteImageUrl(u));
        return {
          ...item,
          imageUrls,
          statusLabel: item.status === "closed" ? "已结束" : "处理中"
        };
      });
      this.setData({ list });
    } catch (err) {
      wx.showToast({ title: err.message || "加载失败", icon: "none" });
    }
  },
  previewImage(e) {
    const current = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.list || [];
    wx.previewImage({ current, urls });
  },
  async onStatusChange(e) {
    const index = e.detail.value;
    const status = this.data.statusOptions[index].value;
    const id = e.currentTarget.dataset.id;
    try {
      const api = this.data.mode === "lost" ? `/lost-items/${id}/status` : `/found-items/${id}/status`;
      await request(api, "PATCH", { status });
      wx.showToast({ title: "状态已更新", icon: "success" });
      this.loadList();
    } catch (err) {
      wx.showToast({ title: err.message || "更新失败", icon: "none" });
    }
  }
});
