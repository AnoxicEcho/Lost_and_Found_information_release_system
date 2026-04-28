const express = require("express");
const auth = require("../middleware/auth");
const {
  createLostItem,
  listLostItems,
  updateLostItemStatus
} = require("../controllers/lostItemController");

const router = express.Router();

router.get("/", listLostItems);
router.post("/", auth(), createLostItem);
router.patch("/:id/status", auth("admin"), updateLostItemStatus);

module.exports = router;
