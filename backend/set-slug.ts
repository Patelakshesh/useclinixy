import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string).then(async () => {
  try {
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin@clinic.com' });
    if (!user) {
        console.log('User not found');
        process.exit(0);
    }
    const clinic = await mongoose.connection.db.collection('clinics').findOne({ _id: user.clinicId });
    if (!clinic) {
        console.log('Clinic not found');
        process.exit(0);
    }
    console.log('\n\n✅ CLINIC NAME: ' + clinic.name);
    
    const slug = clinic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    await mongoose.connection.db.collection('clinics').updateOne({ _id: clinic._id }, { $set: { subdomain: slug } });
    console.log('✅ UPDATED SUBDOMAIN TO: ' + slug + '\n\n');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
