import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../src/models/user.model';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-saas';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'superadmin@clinixy.com' });
    if (adminExists) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123', salt);

    await User.create({
      name: 'Super Admin',
      email: 'superadmin@clinixy.com',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      clinicId: null, // Global access
      status: 'ACTIVE'
    });

    console.log('Super Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding super admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
