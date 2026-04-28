const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

function createToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "7d" }
  );
}

async function register(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码不能为空" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "用户名已存在" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'user')",
      [username, passwordHash]
    );

    const user = { id: result.insertId, username, role: "user" };
    return res.status(201).json({ token: createToken(user), user });
  } catch (error) {
    return res.status(500).json({ message: "注册失败", detail: error.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码不能为空" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    const user = rows[0];
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    return res.json({
      token: createToken(user),
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: "登录失败", detail: error.message });
  }
}

module.exports = { register, login };
