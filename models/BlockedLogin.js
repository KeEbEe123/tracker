import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";

const blockedLoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  reason: { type: String, required: true },
  attemptedAt: { type: Date, default: Date.now },
});

export async function getBlockedLoginModel() {
  await connectDB();
  return mongoose.models.BlockedLogin || mongoose.model("BlockedLogin", blockedLoginSchema);
} 