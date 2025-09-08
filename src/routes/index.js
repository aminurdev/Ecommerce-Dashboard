import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
// Add more routes here

export default router;
