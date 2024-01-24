const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  items: [
    {
      productID: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  deliveryID: {
    type: String,
    default: "none",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "onway", "delivered", "cancelled"],
    default: "pending",
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  address: {
    city: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    maplink: {
      type: String,
      required: false,
    },
    gpsLocation: {
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
  },
  orderID: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
