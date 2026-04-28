const pool = require("../config/db");

async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "用户查询失败", detail: error.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "角色值无效" });
    }
    await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    return res.json({ message: "角色更新成功" });
  } catch (error) {
    return res.status(500).json({ message: "角色更新失败", detail: error.message });
  }
}

module.exports = { getUsers, updateUserRole };
