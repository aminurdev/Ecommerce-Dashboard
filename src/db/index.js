import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection error");
    throw err;
  }
};
