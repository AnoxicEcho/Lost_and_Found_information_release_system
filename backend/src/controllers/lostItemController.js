const pool = require("../config/db");

function normalizeImageUrls(imageUrls) {
  if (!Array.isArray(imageUrls)) {
    return [];
  }
  return imageUrls.filter((url) => typeof url === "string" && url.trim() !== "").slice(0, 5);
}

function parseImageUrls(raw) {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

async function createLostItem(req, res) {
  try {
    const { title, category, description, location, lost_date, contact, image_urls } = req.body;
    if (!title || !category || !description || !location || !lost_date || !contact) {
      return res.status(400).json({ message: "请完整填写失物信息" });
    }

    const imageUrls = normalizeImageUrls(image_urls);
    const [result] = await pool.query(
      `INSERT INTO lost_items (title, category, description, location, lost_date, contact, image_urls, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, description, location, lost_date, contact, JSON.stringify(imageUrls), req.user.id]
    );

    return res.status(201).json({ id: result.insertId, message: "失物信息发布成功" });
  } catch (error) {
    return res.status(500).json({ message: "发布失败", detail: error.message });
  }
}

async function listLostItems(req, res) {
  try {
    const { keyword = "", category = "", status = "" } = req.query;
    const [rows] = await pool.query(
      `SELECT li.*, u.username
       FROM lost_items li
       JOIN users u ON li.user_id = u.id
       WHERE (? = '' OR li.title LIKE CONCAT('%', ?, '%') OR li.description LIKE CONCAT('%', ?, '%'))
         AND (? = '' OR li.category = ?)
         AND (? = '' OR li.status = ?)
       ORDER BY li.created_at DESC`,
      [keyword, keyword, keyword, category, category, status, status]
    );

    return res.json(
      rows.map((item) => ({
        ...item,
        image_urls: parseImageUrls(item.image_urls)
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "查询失败", detail: error.message });
  }
}

async function updateLostItemStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ message: "状态值无效，只能是 open 或 closed" });
    }

    const [result] = await pool.query("UPDATE lost_items SET status = ? WHERE id = ?", [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "失物信息不存在" });
    }
    return res.json({ message: "失物状态更新成功" });
  } catch (error) {
    return res.status(500).json({ message: "状态更新失败", detail: error.message });
  }
}

module.exports = { createLostItem, listLostItems, updateLostItemStatus };
