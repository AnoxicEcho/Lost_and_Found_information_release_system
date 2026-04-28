const jwt = require("jsonwebtoken");

function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "未授权，请先登录" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      req.user = payload;
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: "权限不足" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "登录状态无效，请重新登录" });
    }
  };
}

module.exports = auth;
