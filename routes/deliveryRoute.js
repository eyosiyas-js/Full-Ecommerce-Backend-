const express = require("express");
const Order = require("../models/Order.js");
const deliveryChecker = require("../middleware/deliveryChecker.js");

const router = express.Router();

router.get("/orders/:id", deliveryChecker, async (req, res) => {
  try {
    const order = await Order.findOne({
      orderID: req.params.id,
      deliveryID: req.user.userID,
    });

    if (!order) return res.status(404).send({ error: "Order not found." });

    res.send(order.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Could not find order" });
  }
});

router.get("/orders", deliveryChecker, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const ordersCount = await Order.countDocuments({
      deliveryID: req.user.userID,
    });
    const orders = await Order.find({ deliveryID: req.user.userID })
      .sort({ createdAt: 1 })
      .skip(startIndex)
      .limit(limit);

    const results = {
      page: page,
      limit: limit,
      totalPages: Math.ceil(ordersCount / limit),
      totalOrders: ordersCount,
      orders: orders,
    };

    res.send(results);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error getting orders" });
  }
});

module.exports = router;
