import cron from 'node-cron';
import Subscription from '../models/subscription.model';
import Clinic from '../models/clinic.model';

/**
 * Runs every day at 2:00 AM.
 * Checks all ACTIVE subscriptions — if currentPeriodEnd has passed, marks them EXPIRED
 * and suspends the clinic account automatically.
 */
export const startSubscriptionExpiryJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Running subscription expiry check...');
    
    try {
      const now = new Date();
      
      // Find all ACTIVE subscriptions that have passed their period end
      const expiredSubscriptions = await Subscription.find({
        status: 'ACTIVE',
        currentPeriodEnd: { $lt: now },
      });

      if (expiredSubscriptions.length === 0) {
        console.log('[Cron] No expired subscriptions found.');
        return;
      }

      console.log(`[Cron] Found ${expiredSubscriptions.length} expired subscription(s). Processing...`);

      for (const sub of expiredSubscriptions) {
        try {
          // Mark subscription as expired
          sub.status = 'EXPIRED' as any;
          await sub.save();

          // Suspend the clinic
          await Clinic.findByIdAndUpdate(sub.clinicId, { status: 'SUSPENDED' });

          console.log(`[Cron] Clinic ${sub.clinicId} suspended due to subscription expiry.`);
        } catch (err) {
          console.error(`[Cron] Failed to process subscription ${sub._id}:`, err);
        }
      }

      console.log(`[Cron] Subscription expiry check complete. ${expiredSubscriptions.length} clinic(s) suspended.`);
    } catch (error) {
      console.error('[Cron] Subscription expiry job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata', // IST timezone
  });

  console.log('[Cron] Subscription expiry job scheduled (runs daily at 2:00 AM IST).');
};
