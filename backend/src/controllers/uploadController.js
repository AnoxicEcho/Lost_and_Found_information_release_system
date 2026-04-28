const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    cb(new Error("仅支持 jpg/png/webp/gif 图片"));
    return;
  }
  cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

function uploadSingle(req, res) {
  uploader.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "上传失败" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "请选择图片文件" });
    }
    return res.status(201).json({
      message: "上传成功",
      url: `/uploads/${req.file.filename}`
    });
  });
}

module.exports = { uploadSingle };
