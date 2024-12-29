const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
//const RefreshToken = require("../models/Token");

const { v4: uuidv4 } = require("uuid");

const getUniqueId = () => {
  return uuidv4();
};

const getTime = () => {
  return Date.now();
};

module.exports = {
  // getRefreshToken,
  hash,
  generateActivationToken,
  verifyActivationToken,
  randomTokenString,
  setTokenCookie,
  padNumber,
  getUniqueId,
  getTime,
};

function padNumber(n, width, z) {
  z = z || "0";
  n = n + "";
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyActivationToken(activationToken) {
  let verifyToken = jwt.verify(activationToken, process.env.SECRET_KEY);

  return verifyToken;
}

function generateActivationToken(user) {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      activationCode,
    },
    process.env.SECRET_KEY,
    { expiresIn: "5m" }
  );
  return { activationCode, token };
}

function randomTokenString() {
  return crypto.randomBytes(4).toString("hex").toLocaleUpperCase();
}

function setTokenCookie(res, token) {
  // create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
}
