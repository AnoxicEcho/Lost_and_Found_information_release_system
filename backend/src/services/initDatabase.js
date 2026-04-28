const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function addColumnIfMissing(tableName, columnName, definition) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );

  if (rows[0].count === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureDateTimeColumn(tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT DATA_TYPE AS dataType
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  if (rows.length === 0) {
    return;
  }

  if (rows[0].dataType !== "datetime") {
    await pool.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} DATETIME NOT NULL`);
  }
}

async function initDatabase() {
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createLostItems = `
    CREATE TABLE IF NOT EXISTS lost_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(100) NOT NULL,
      lost_date DATETIME NOT NULL,
      contact VARCHAR(100) NOT NULL,
      image_urls TEXT NULL,
      status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  const createFoundItems = `
    CREATE TABLE IF NOT EXISTS found_items (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(100) NOT NULL,
      found_date DATETIME NOT NULL,
      contact VARCHAR(100) NOT NULL,
      image_urls TEXT NULL,
      status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  await pool.query(createUsers);
  await pool.query(createLostItems);
  await pool.query(createFoundItems);
  await addColumnIfMissing("lost_items", "image_urls", "TEXT NULL");
  await addColumnIfMissing("found_items", "image_urls", "TEXT NULL");
  await ensureDateTimeColumn("lost_items", "lost_date");
  await ensureDateTimeColumn("found_items", "found_date");

  const [rows] = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  if (rows.length === 0) {
    const adminHash = await bcrypt.hash("admin123", 10);
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')",
      ["admin", adminHash]
    );
  }
}

module.exports = initDatabase;
