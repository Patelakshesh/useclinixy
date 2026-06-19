import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startSubscriptionExpiryJob } from './cron/subscriptionExpiry.job';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-saas';

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Start background jobs
    startSubscriptionExpiryJob();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

