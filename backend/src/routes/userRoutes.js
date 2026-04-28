const express = require("express");
const auth = require("../middleware/auth");
const { getUsers, updateUserRole } = require("../controllers/userController");

const router = express.Router();

router.get("/", auth("admin"), getUsers);
router.patch("/:id/role", auth("admin"), updateUserRole);

module.exports = router;
