const express = require("express");
const auth = require("../middleware/auth");
const { uploadSingle } = require("../controllers/uploadController");

const router = express.Router();

router.post("/image", auth(), uploadSingle);

module.exports = router;
