import { app } from "./app.js";
import connectDB from "./config/db.js";
import ENV from "./config/env.js";
import { logger } from "./config/logger.js";

connectDB()
  .then(() => {
    // Start the server
    app.listen(ENV.PORT, () => {
      logger.info(`Server running on port ${ENV.PORT}`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection FAILED !!!", err);
  });
