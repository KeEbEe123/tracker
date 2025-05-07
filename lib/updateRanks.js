import { getTeacherModel } from "@/models/Teacher";
import connectDB from "@/lib/mongoose";

async function updateRanks() {
  await connectDB();
  const TeacherModel = await getTeacherModel();
  const teachers = await TeacherModel.find({}).sort({ totalPoints: -1 });
  try {
    if (teachers.length > 0) {
      const bulkOps = teachers.map((teacher, i) => ({
        updateOne: {
          filter: { _id: teacher._id },
          update: { $set: { rank: i + 1 } }
        }
      }));
      await TeacherModel.bulkWrite(bulkOps);
    }
    console.log(`[${new Date().toISOString()}] Ranks updated for ${teachers.length} teachers.`);
  } catch (err) {
    console.error('Error updating ranks:', err);
  }
}

updateRanks().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
}); 