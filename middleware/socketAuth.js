const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.secretKey;

function socketAuth(socket, next) {
  if (
    socket.handshake.headers.authorization &&
    socket.handshake.headers.authorization
  ) {
    const token = socket.handshake.headers.authorization.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, secretKey);
      socket.user = decoded;
      next();
    } catch (err) {
      throw new Error("Invalid/Expired token");
    }
  } else {
    throw new Error("Invalid/Expired token");
  }
}

module.exports = socketAuth;
