App({
  globalData: {
    user: null
  },
  onLaunch() {
    const user = wx.getStorageSync("lf_user");
    if (user) {
      this.globalData.user = user;
    }
  }
});
