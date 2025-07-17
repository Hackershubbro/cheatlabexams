const mongoose = require("mongoose");
require("dotenv").config();

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL + process.env.DATABASE_NAME, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // exit app if DB fails
  }
}

module.exports = connectToDB;
