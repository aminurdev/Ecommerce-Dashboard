import express from "express";
import dotenv from "dotenv";
import compression from "compression";
import passport from "passport";
import cors from "cors";

// Import middleware
import {
  corsOptions,
  globalRateLimit,
  helmetConfig,
} from "./middleware/security.js";
import errorHandler from "./middleware/errorHandler.js";

// Import routes
import routes from "./routes/index.js";

// Import database
import sequelize from "./config/database.js";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(globalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use("/api", routes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Database connected successfully");

    // Sync database (in development)
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      logger.info("Database synchronized");
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await sequelize.close();
  process.exit(0);
});

startServer();

export default app;
