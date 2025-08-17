import mongoose from "mongoose";
import ENV from "#config/env";
import { logger } from "#config/logger";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(ENV.MONGO_URI);
    logger.info(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (err) {
    logger.error("MongoDB connection FAILED: " + err);
    process.exit(1);
  }
};

export default connectDB;
