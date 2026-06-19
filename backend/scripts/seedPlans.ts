import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SubscriptionPlan from '../src/models/subscriptionPlan.model';

dotenv.config();

const seedPlans = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-saas';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const plans = [
      {
        name: 'Starter',
        priceId: 'price_starter_001',
        price: 0,
        currency: 'INR',
        interval: 'MONTHLY',
        features: {
          maxDoctors: 1,
          maxPatients: 100,
          hasWhatsApp: false,
          hasOnlineBooking: false,
        },
        isActive: true,
      },
      {
        name: 'Pro',
        priceId: 'price_pro_001',
        price: 1999,
        currency: 'INR',
        interval: 'MONTHLY',
        features: {
          maxDoctors: 5,
          maxPatients: 2000,
          hasWhatsApp: true,
          hasOnlineBooking: true,
        },
        isActive: true,
      },
      {
        name: 'Premium',
        priceId: 'price_premium_001',
        price: 4999,
        currency: 'INR',
        interval: 'MONTHLY',
        features: {
          maxDoctors: 999, // practically unlimited
          maxPatients: 999999,
          hasWhatsApp: true,
          hasOnlineBooking: true,
        },
        isActive: true,
      }
    ];

    await SubscriptionPlan.deleteMany({});
    await SubscriptionPlan.insertMany(plans);

    console.log('Seeded subscription plans successfully');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedPlans();
