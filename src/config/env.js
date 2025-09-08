import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(8080),
  CLIENT_ORIGIN: z.string(),
  MONGODB_URI: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EMAIL_VERIFY_SECRET: z.string(),
  JWT_RESET_SECRET: z.string(),
  JWT_ACCESS_EXPIRES: z.string(),
  JWT_REFRESH_EXPIRES: z.string(),
  JWT_EMAIL_VERIFY_EXPIRES: z.string(),
  JWT_RESET_EXPIRES: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  MAIL_FROM: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
});

export const env = envSchema.parse(process.env);
