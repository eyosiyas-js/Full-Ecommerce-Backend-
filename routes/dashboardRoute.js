const express = require("express");
const Product = require("../models/Product.js");
const Order = require("../models/Order.js");
const User = require("../models/User.js");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ];

    const orderCounts = await Order.aggregate(pipeline);
    const ordersDataset = Array(today.getMonth() + 1).fill(0);
    orderCounts.forEach((orderCount) => {
      ordersDataset[orderCount._id.month - 1] = orderCount.count;
    });
    const ordersThisMonth = await Order.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const usersCounts = await User.aggregate(pipeline);
    const usersDataset = Array(today.getMonth() + 1).fill(0);
    usersCounts.forEach((userCount) => {
      usersDataset[userCount._id.month - 1] = userCount.count;
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    const ordersRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]).then((results) => (results.length > 0 ? results[0].total : 0));
    const totalRevenue = ordersRevenue.length > 0 ? ordersRevenue[0].total : 0;

    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});

    res.send({
      newUsersThisMonth: newUsersThisMonth,
      totalUsers: totalUsers,
      usersDataset: usersDataset,
      ordersThisMonth: ordersThisMonth,
      totalOrders: totalOrders,
      ordersDataset: ordersDataset,
      revenueThisMonth: revenueThisMonth,
      totalRevenue: totalRevenue,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/products", async (req, res) => {
  try {
    const pipeline = [
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productID",
          totalQuantity: { $sum: "$items.quantity" },
          maxOrderID: { $max: "$orderID" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ];
    const results = await Order.aggregate(pipeline);
    const bestSellingProducts = await Promise.all(
      results.map(async (product, index) => {
        const { _id, totalQuantity, maxOrderID } = product;
        const bestSellingProduct = await Order.findOne({
          "items.productID": _id,
        })
          .select("items")
          .sort({ createdAt: -1 });
        return {
          rank: index + 1,
          productID: _id,
          quantitySold: totalQuantity,
          name: bestSellingProduct.items.find((item) => item.productID == _id)
            .name,
          orderID: maxOrderID,
        };
      })
    );
    res.json(bestSellingProducts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
