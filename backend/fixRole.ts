import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model';

dotenv.config();

const fixRole = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-saas';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await User.updateOne({ email: 'admin@clinic.com' }, { $set: { role: 'CLINIC_ADMIN' } });
    console.log('Fixed admin@clinic.com role to CLINIC_ADMIN');

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixRole();
