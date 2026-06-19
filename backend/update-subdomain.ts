import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  try {
    await mongoose.connection.db.collection('clinics').updateMany({}, { $set: { subdomain: 'my-clinic' } });
    console.log('✅ Updated all clinics to have subdomain: my-clinic');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
