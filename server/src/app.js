import cors from "cors";
import express from "express";
import RootRouter from "./root.routes.js";
import { ApiError } from "./utils/api.res.js";
import globalErrorHandler from "./middlewares/handleGlobal.error.js";

const app = express();

app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "Content-Disposition"],
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use("/api/v1", RootRouter);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the e-commerce API",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 route handler
// eslint-disable-next-line no-unused-vars
app.use((req, res, next) => {
  throw new ApiError(404, `Can't find ${req.originalUrl} on this server.`);
});

app.use(globalErrorHandler);
export { app };
