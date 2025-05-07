// scripts/migrateCertTypes.js
import mongoose from "mongoose";
import { getTeacherModel } from "../models/Teacher";
import connectDB from "../lib/mongoose";

async function migrateCertificationTypes() {
  await connectDB();
  const Teacher = await getTeacherModel();

  const teachers = await Teacher.find({});

  for (const teacher of teachers) {
    let updated = false;

    teacher.certifications.forEach((cert) => {
      if (!cert.type) {
        cert.type = "other";
        updated = true;
      }
    });

    if (updated) {
      await teacher.save(); // Triggers pre-save middleware
      console.log(`✅ Updated teacher: ${teacher.name}`);
    }
  }

  mongoose.connection.close();
  console.log("🎉 Migration completed.");
}

migrateCertificationTypes().catch((err) => {
  console.error("❌ Migration failed:", err);
  mongoose.connection.close();
});
