const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRE, JWT_REFRESH_EXPIRE } = require("../config/env");

const generateToken = (userId, rememberMe = false) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : JWT_EXPIRE,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = { generateToken, generateRefreshToken, verifyRefreshToken };
