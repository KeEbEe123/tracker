import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";

const teacherSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, required: true },
  department: { type: String, required: true },
  profilePicture: { type: String }, // URL to profile picture
  certifications: [
    {
      name: { type: String, required: true },
      issuingOrganization: { type: String, required: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date },
      credentialId: { type: String },
      credentialUrl: { type: String },
      imageUrl: { type: String }, // URL to certification image
    },
  ],
  totalPoints: { type: Number, default: 0 },
  improvementRate: { type: Number, default: 0 }, // New field for improvement rate percentage
  recentAchievement: { type: String }, // New field for recent achievement
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt`
teacherSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Middleware to calculate points
teacherSchema.pre("save", function (next) {
  this.totalPoints = this.certifications.length * 10;
  next();
});

// ❗ Don't create the model immediately

export async function getTeacherModel() {
  await connectDB();

  // Prevent model overwrite errors during HMR (Hot Module Replacement)
  return mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
}
