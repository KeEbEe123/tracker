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
      credentialId: { type: String },
      credentialUrl: { type: String },
      imageUrl: { type: String }, // URL to certification image
      type: {
        type: String,
        required: true,
        enum: ["fdp", "global", "webinar", "online", "other"],
        default: "other",
      },
      points: { type: Number, required: true },
    },
  ],
  totalPoints: { type: Number, default: 0 },
  improvementRate: { type: Number, default: 0 }, // New field for improvement rate percentage
  recentAchievement: { type: String }, // New field for recent achievement
  rank: { type: Number, default: null }, // Faculty rank
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt`
teacherSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Middleware to calculate points based on certification type
teacherSchema.pre("save", function (next) {
  const pointsMap = {
    fdp: 5,
    global: 10,
    webinar: 3,
    online: 8,
    other: 2,
  };

  // Calculate points for each certification
  this.certifications.forEach((cert) => {
    cert.points = pointsMap[cert.type] || 2;
  });

  // Calculate total points
  this.totalPoints = this.certifications.reduce(
    (sum, cert) => sum + cert.points,
    0
  );
  next();
});

// ❗ Don't create the model immediately

export async function getTeacherModel() {
  await connectDB();

  // Prevent model overwrite errors during HMR (Hot Module Replacement)
  return mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
}
