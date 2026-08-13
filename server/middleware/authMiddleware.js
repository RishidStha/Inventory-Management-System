const jwt = require("jsonwebtoken");

// Protects a route: request must include "Authorization: Bearer <token>"
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, name } - available in every controller after this
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ error: "Invalid or expired token. Please log in again." });
  }
}

module.exports = requireAuth;
