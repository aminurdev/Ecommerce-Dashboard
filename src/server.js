import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./db/index.js";
import { logger } from "./config/logger.js";

const start = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
};

start();
