Page({
  data: {
    user: null
  },
  onShow() {
    const user = wx.getStorageSync("lf_user");
    this.setData({ user: user || null });
  },
  goAuth() {
    wx.navigateTo({ url: "/pages/auth/index" });
  },
  logout() {
    wx.removeStorageSync("lf_token");
    wx.removeStorageSync("lf_user");
    getApp().globalData.user = null;
    this.setData({ user: null });
    wx.showToast({ title: "已退出", icon: "success" });
  }
});
