import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  roles: { type: [String], default: ["user"] },
  isVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
