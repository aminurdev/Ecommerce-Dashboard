import { createLogger, format, transports } from "winston";
import ENV from "./env.js";

const isProd = ENV.NODE_ENV === "production";

export const logger = createLogger({
  level: ENV.LOG_LEVEL || "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    isProd
      ? format.json()
      : format.combine(
          format.colorize(),
          format.printf(
            ({ level, message, timestamp, stack }) =>
              `${timestamp.slice(11, 19)} [${level}]: ${stack || message}`
          )
        )
  ),
  transports: [
    new transports.Console({ handleExceptions: true }),
    ...(isProd
      ? [
          new transports.File({
            filename: "logs/error.log",
            level: "error",
            maxsize: 5242880,
            maxFiles: 3,
          }),
          new transports.File({
            filename: "logs/app.log",
            maxsize: 5242880,
            maxFiles: 3,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});
