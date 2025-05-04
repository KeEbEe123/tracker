import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";

const certificationLinkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  description: { type: String, required: true },
  lastDateToApply: { type: Date, required: true },
  department: { type: String, default: "All Departments" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt`
certificationLinkSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export async function getCertificationLinkModel() {
  await connectDB();

  // Prevent model overwrite errors during HMR (Hot Module Replacement)
  return (
    mongoose.models.CertificationLink ||
    mongoose.model("CertificationLink", certificationLinkSchema)
  );
}
