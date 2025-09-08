import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import { logger, httpLogger } from "./config/logger.js";
import { responseEnhancer } from "./middlewares/response.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import router from "./routes/index.js";
import rateLimit from "./middlewares/rateLimit.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(httpLogger);
app.use(morgan("tiny"));
app.use(rateLimit);
app.use(responseEnhancer);

app.get("/health", (req, res) => res.ok({ uptime: process.uptime() }));
app.use("/api", router);

app.use(notFound);
app.use(errorHandler);
