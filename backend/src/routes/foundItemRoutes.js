const express = require("express");
const auth = require("../middleware/auth");
const {
  createFoundItem,
  listFoundItems,
  updateFoundItemStatus
} = require("../controllers/foundItemController");

const router = express.Router();

router.get("/", listFoundItems);
router.post("/", auth(), createFoundItem);
router.patch("/:id/status", auth("admin"), updateFoundItemStatus);

module.exports = router;
