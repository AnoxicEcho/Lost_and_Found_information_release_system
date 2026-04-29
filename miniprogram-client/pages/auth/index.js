const { request } = require("../../utils/request");

Page({
  data: {
    isLogin: true,
    loading: false,
    form: {
      username: "",
      password: ""
    }
  },
  onInput(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    this.setData({
      [`form.${key}`]: value
    });
  },
  switchMode() {
    this.setData({
      isLogin: !this.data.isLogin
    });
  },
  async submit() {
    const { username, password } = this.data.form;
    if (!username || !password) {
      wx.showToast({ title: "请填写用户名和密码", icon: "none" });
      return;
    }
    this.setData({ loading: true });
    try {
      const api = this.data.isLogin ? "/auth/login" : "/auth/register";
      const data = await request(api, "POST", { username, password });
      wx.setStorageSync("lf_token", data.token);
      wx.setStorageSync("lf_user", data.user);
      getApp().globalData.user = data.user;
      wx.switchTab({ url: "/pages/home/index" });
    } catch (err) {
      wx.showToast({ title: err.message || "请求失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  }
});
