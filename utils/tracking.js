const Order = require("../models/Order");
const User = require("../models/User");

async function move(location, orderID) {
  const order = await Order.findOne({ orderID: orderID });

  order.address.gpsLocation.latitude = location.latitude;
  order.address.gpsLocation.longitude = location.longitude;

  await order.save();
}
