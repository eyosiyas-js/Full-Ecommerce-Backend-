const { io } = require("socket.io-client");

const socket = io("http://localhost:80");

socket.emit("joinRoom", orderID);

// Start delivery
socket.emit("start", orderID);

const location = {
  latitude: -58.7,
  longitude: 96,
};

// Update location on every move
socket.emit("move", orderID, location);

// Once the delivery arrives on the location
socket.emit("arrived", orderID);
