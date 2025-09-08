import pino from "pino";
import pinoPretty from "pino-pretty";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

export const httpLogger = (req, res, next) => {
  logger.info({ method: req.method, url: req.url });
  next();
};
