import cron from 'node-cron';

/**
 * Keep-Alive Job:
 * Pings the backend health endpoint every 14 minutes.
 * Prevents free cloud hosts (like Render.com) from spinning down into sleep mode.
 */
export const startKeepAliveJob = () => {
  const backendUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL;

  if (!backendUrl) {
    console.log('[KeepAlive] No BACKEND_URL or RENDER_EXTERNAL_URL configured. Self-ping skipped in local mode.');
    return;
  }

  // Runs every 14 minutes (Render sleeps at 15 minutes of inactivity)
  cron.schedule('*/14 * * * *', async () => {
    try {
      const cleanUrl = backendUrl.replace(/\/$/, '');
      const healthEndpoint = cleanUrl.endsWith('/api/health') ? cleanUrl : `${cleanUrl}/api/health`;
      const res = await fetch(healthEndpoint);
      console.log(`[KeepAlive] Pinged ${healthEndpoint} -> Status: ${res.status}`);
    } catch (err: any) {
      console.error('[KeepAlive] Self-ping failed:', err?.message || err);
    }
  });

  console.log(`[KeepAlive] Scheduled 14-minute self-ping job for: ${backendUrl}`);
};
