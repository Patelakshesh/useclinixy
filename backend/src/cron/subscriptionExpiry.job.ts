import cron from 'node-cron';
import Subscription from '../models/subscription.model';
import Clinic from '../models/clinic.model';
import { sendAdminTrialExpiryAlert } from '../services/email.service';

/**
 * Runs every day at 2:00 AM IST.
 * 1. Alerts admin when a clinic trial has 3 days left
 * 2. Alerts admin when a clinic trial has 1 day left
 * 3. Expires & suspends clinics whose trial ended
 */
export const startSubscriptionExpiryJob = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Running subscription expiry check...');
    
    try {
      const now = new Date();

      // ── Alert admin: 3 days left ───────────────────────────────────────────
      const threeDaysFromNow = new Date(now);
      threeDaysFromNow.setDate(now.getDate() + 3);
      const threeDaysStart = new Date(threeDaysFromNow);
      threeDaysStart.setHours(0, 0, 0, 0);
      const threeDaysEnd = new Date(threeDaysFromNow);
      threeDaysEnd.setHours(23, 59, 59, 999);

      const expiringIn3Days = await Subscription.find({
        status: 'ACTIVE',
        currentPeriodEnd: { $gte: threeDaysStart, $lte: threeDaysEnd },
      }).populate('clinicId');

      for (const sub of expiringIn3Days) {
        const clinic = sub.clinicId as any;
        if (clinic) {
          await sendAdminTrialExpiryAlert(
            clinic.name, clinic.email, clinic.mobileNumber || clinic.phone || '', clinic.subdomain, 3
          ).catch(err => console.error('[Cron] 3-day alert failed:', err));
        }
      }

      // ── Alert admin: 1 day left ───────────────────────────────────────────
      const oneDayFromNow = new Date(now);
      oneDayFromNow.setDate(now.getDate() + 1);
      const oneDayStart = new Date(oneDayFromNow);
      oneDayStart.setHours(0, 0, 0, 0);
      const oneDayEnd = new Date(oneDayFromNow);
      oneDayEnd.setHours(23, 59, 59, 999);

      const expiringIn1Day = await Subscription.find({
        status: 'ACTIVE',
        currentPeriodEnd: { $gte: oneDayStart, $lte: oneDayEnd },
      }).populate('clinicId');

      for (const sub of expiringIn1Day) {
        const clinic = sub.clinicId as any;
        if (clinic) {
          await sendAdminTrialExpiryAlert(
            clinic.name, clinic.email, clinic.mobileNumber || clinic.phone || '', clinic.subdomain, 1
          ).catch(err => console.error('[Cron] 1-day alert failed:', err));
        }
      }

      // ── Expire & suspend overdue subscriptions ────────────────────────────
      const expiredSubscriptions = await Subscription.find({
        status: 'ACTIVE',
        currentPeriodEnd: { $lt: now },
      }).populate('clinicId');

      if (expiredSubscriptions.length === 0) {
        console.log('[Cron] No expired subscriptions found.');
      } else {
        console.log(`[Cron] Found ${expiredSubscriptions.length} expired subscription(s). Processing...`);

        for (const sub of expiredSubscriptions) {
          try {
            const clinic = sub.clinicId as any;

            // Alert admin that this clinic just expired
            if (clinic) {
              await sendAdminTrialExpiryAlert(
                clinic.name, clinic.email, clinic.mobileNumber || clinic.phone || '', clinic.subdomain, 0
              ).catch(err => console.error('[Cron] Expiry-day alert failed:', err));
            }

            // Mark subscription expired and suspend clinic
            sub.status = 'EXPIRED' as any;
            await sub.save();
            await Clinic.findByIdAndUpdate(sub.clinicId, { status: 'SUSPENDED' });

            console.log(`[Cron] Clinic ${clinic?.name || sub.clinicId} suspended due to subscription expiry.`);
          } catch (err) {
            console.error(`[Cron] Failed to process subscription ${sub._id}:`, err);
          }
        }
      }

      console.log('[Cron] Subscription expiry check complete.');
    } catch (error) {
      console.error('[Cron] Subscription expiry job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata',
  });

  console.log('[Cron] Subscription expiry job scheduled (runs daily at 2:00 AM IST).');
};

