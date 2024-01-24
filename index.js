const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoute = require("./routes/authRoute.js");
const usersRoute = require("./routes/usersRoute.js");
const adminRoute = require("./routes/adminRoute.js");
const deliveryRoute = require("./routes/deliveryRoute.js");
const productRoute = require("./routes/productRoute.js");
const orderRoute = require("./routes/orderRoute.js");
const searchRoute = require("./routes/searchRoute.js");
const reviewRoute = require("./routes/reviewRoute.js");
const paymentRoute = require("./routes/paymentRoute.js");
const dashboardRoute = require("./routes/dashboardRoute.js");
const uploadRoute = require("./routes/uploadRoute.js");
const http = require("http");
const socketIO = require("socket.io");
const socketRoute = require("./routes/socketRoute.js");

dotenv.config();

const app = express();
const port = process.env.PORT || 80;
const mongouri = process.env.mongo_url;

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/admin", adminRoute);
app.use("/api/delivery", deliveryRoute);
app.use("/api/product", productRoute);
app.use("/api/order", orderRoute);
app.use("/api/search", searchRoute);
app.use("/api/review", reviewRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/upload", uploadRoute);

app.get("/", (req, res) => {
  res.send(`Hello World! ${req.protocol}://${req.hostname}`);
});

mongoose.set("strictQuery", false);
mongoose
  .connect(mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected!");

    const server = http.createServer(app);
    const io = socketIO(server);

    io.on("connection", (socket) => {
      // socketRoute(socket);
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
    });

    server.listen(port, () =>
      console.log(`Listening on: http://localhost:${port}`)
    );
  })
  .catch((err) => console.error(err));
