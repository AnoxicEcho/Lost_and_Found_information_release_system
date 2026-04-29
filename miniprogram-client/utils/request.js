const { API_BASE, FILE_BASE } = require("./config");

function request(url, method = "GET", data = {}) {
  const token = wx.getStorageSync("lf_token") || "";
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data || { message: "请求失败" });
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function uploadImage(localPath) {
  const token = wx.getStorageSync("lf_token") || "";
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE}/upload/image`,
      filePath: localPath,
      name: "image",
      header: {
        Authorization: token ? `Bearer ${token}` : ""
      },
      success: (res) => {
        const data = JSON.parse(res.data || "{}");
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data.url);
        } else {
          reject(data || { message: "上传失败" });
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function toAbsoluteImageUrl(url) {
  if (!url) {
    return "";
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${FILE_BASE}${url}`;
  }
  return `${FILE_BASE}/${url}`;
}

module.exports = {
  request,
  uploadImage,
  toAbsoluteImageUrl
};
