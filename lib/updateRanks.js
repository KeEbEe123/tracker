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
  console.log(`Ranks updated for ${teachers.length} teachers.`);
}

updateRanks().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
}); 