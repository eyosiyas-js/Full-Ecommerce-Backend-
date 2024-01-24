const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
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
      default: "",
    },
  },
  role: {
    type: String,
    enum: ["admin", "delivery", "client"],
    default: "client",
  },
  profilePicture: {
    type: String,
    default: "none",
  },
  userID: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordCode: {
    type: Number,
    default: 0,
  },
  resetPasswordExpires: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
