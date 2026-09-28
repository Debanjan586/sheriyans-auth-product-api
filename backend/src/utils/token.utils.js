const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function generateAccessToken(userId) {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

function hashRefreshToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
};