import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  try {
    await mongoose.connection.collection('appointments').dropIndex('doctorId_1_appointmentDate_1_appointmentTime_1');
    console.log('Successfully dropped unique index');
  } catch (err: any) {
    console.log('Index drop ignored or failed:', err.message);
  }
  process.exit(0);
});
