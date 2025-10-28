// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ✅ load .env first

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI; // use env variable instead of hardcoding

    if (!uri) {
      throw new Error("MongoDB URI is missing in .env file");
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
