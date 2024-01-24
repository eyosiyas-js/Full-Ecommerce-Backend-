const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    trim: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  profilePicture: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  productID: {
    type: String,
    required: true,
    trim: true,
  },
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
