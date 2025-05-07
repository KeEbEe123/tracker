import cron from "node-cron";
import { getTeacherModel } from "@/models/Teacher";
import connectDB from "@/lib/mongoose";

async function updateRanks() {
  await connectDB();
  const TeacherModel = await getTeacherModel();
  const teachers = await TeacherModel.find({}).sort({ totalPoints: -1 });
  for (let i = 0; i < teachers.length; i++) {
    teachers[i].rank = i + 1;
    await teachers[i].save();
  }
  console.log(`[${new Date().toISOString()}] Ranks updated for ${teachers.length} teachers.`);
}

// Schedule: Midnight IST (UTC+5:30) = 19:30 UTC
cron.schedule("30 19 * * *", () => {
  updateRanks().catch(console.error);
}, {
  timezone: "Asia/Kolkata"
});

console.log("Rank update scheduler started (runs every midnight IST).\n"); 