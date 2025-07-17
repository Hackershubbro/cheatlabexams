const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  imgbbId: { type: String, required: true },
  url: { type: String, required: true },
  displayUrl: String,
  deleteUrl: { type: String, required: true },
  width: Number,
  height: Number,
  size: Number,
  expiresAt: { type: Date, index: true }
}, { _id: false });

const dataBaseSchema = new Schema({
  key: { type: String, required: true, unique: true, trim: true },
  password: { type: String, select: false },
  content: String,
  images: [imageSchema],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    index: { expires: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model("Data", dataBaseSchema);
