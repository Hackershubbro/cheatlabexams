const mongoose = require("mongoose");
const axios = require("axios");

const imageSchema = new mongoose.Schema({
  imgbbId: { 
    type: String,
    required: true 
  },
  url: {
    type: String,
    required: true
  },
  displayUrl: String,
  deleteUrl: {
    type: String,
    required: true
  },
  width: Number,
  height: Number,
  size: Number,
  expiresAt: {
    type: Date,
    index: true
  }
}, { _id: false });

const dataBaseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  content: String,
  images: [imageSchema],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    index: { expires: 0 }
  }
}, { timestamps: true });

// Middleware to delete images from imgBB before document removal
dataBaseSchema.pre('deleteOne', { document: true }, async function(next) {
  try {
    await Promise.all(
      this.images.map(async (image) => {
        try {
          await axios.get(image.deleteUrl);
          console.log(`Deleted image ${image.imgbbId} from imgBB`);
        } catch (err) {
          console.error(`Failed to delete image ${image.imgbbId}:`, err.message);
        }
      })
    );
    next();
  } catch (err) {
    next(err);
  }
});

// Create TTL index for images
dataBaseSchema.index({ "images.expiresAt": 1 });

module.exports = mongoose.model("Data", dataBaseSchema);