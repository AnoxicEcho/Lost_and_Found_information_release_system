const { request, uploadImage } = require("../../utils/request");

Page({
  data: {
    mode: "lost",
    loading: false,
    datePart: "",
    timePart: "",
    imageLocalPaths: [],
    form: {
      title: "",
      category: "",
      description: "",
      location: "",
      contact: ""
    }
  },
  onShow() {
    const token = wx.getStorageSync("lf_token");
    if (!token) {
      wx.navigateTo({ url: "/pages/auth/index" });
    }
  },
  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode });
  },
  onInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [`form.${key}`]: e.detail.value
    });
  },
  onDateChange(e) {
    this.setData({ datePart: e.detail.value });
  },
  onTimeChange(e) {
    this.setData({ timePart: e.detail.value });
  },
  chooseImages() {
    const remain = 5 - this.data.imageLocalPaths.length;
    if (remain <= 0) {
      wx.showToast({ title: "最多 5 张图片", icon: "none" });
      return;
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ["image"],
      success: (res) => {
        const files = res.tempFiles.map((f) => f.tempFilePath);
        this.setData({
          imageLocalPaths: [...this.data.imageLocalPaths, ...files]
        });
      }
    });
  },
  async submit() {
    const { title, category, description, location, contact } = this.data.form;
    if (!title || !category || !description || !location || !contact || !this.data.datePart || !this.data.timePart) {
      wx.showToast({ title: "请完整填写信息", icon: "none" });
      return;
    }

    this.setData({ loading: true });
    try {
      const imageUrls = [];
      for (let i = 0; i < this.data.imageLocalPaths.length; i += 1) {
        const url = await uploadImage(this.data.imageLocalPaths[i]);
        imageUrls.push(url);
      }

      const dateTime = `${this.data.datePart} ${this.data.timePart}:00`;
      const payload =
        this.data.mode === "lost"
          ? {
              title,
              category,
              description,
              location,
              contact,
              lost_date: dateTime,
              image_urls: imageUrls
            }
          : {
              title,
              category,
              description,
              location,
              contact,
              found_date: dateTime,
              image_urls: imageUrls
            };

      const api = this.data.mode === "lost" ? "/lost-items" : "/found-items";
      await request(api, "POST", payload);
      wx.showToast({ title: "发布成功", icon: "success" });
      this.setData({
        datePart: "",
        timePart: "",
        imageLocalPaths: [],
        form: {
          title: "",
          category: "",
          description: "",
          location: "",
          contact: ""
        }
      });
    } catch (err) {
      wx.showToast({ title: err.message || "发布失败", icon: "none" });
    } finally {
      this.setData({ loading: false });
    }
  }
});
