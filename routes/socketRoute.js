function socketRoute(socket) {
  socket.on("joinRoom", (orderID) => {
    socket.join(orderID);
    console.log(`Joined room ${orderID}`);
  });

  socket.on("start", (orderID) => {
    io.to(orderID).emit("delivery-started");
    console.log(`Order ${orderID} started`);
  });

  socket.on("move", (orderID, location) => {
    io.to(orderID).emit("delivery-moved", location);
    console.log(`Moved ${orderID}`, location);
  });

  socket.on("arrived", (orderID) => {
    io.to(orderID).emit("delivery-arrived");
    console.log(`Order ${orderID} arrived`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected.");
  });
}

module.exports = socketRoute;
