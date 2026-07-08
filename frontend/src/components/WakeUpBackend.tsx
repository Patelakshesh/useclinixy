'use client';

import { useEffect } from 'react';

export default function WakeUpBackend() {
  useEffect(() => {
    // Fire and forget request to wake up the Render backend
    // Notice that we use the base API URL without /v1, directly calling /api/health
    const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const BASE_URL = API_URL.replace(/\/api\/v1$/, ''); // Get http://localhost:5000 or the production Render URL
    
    if (BASE_URL) {
      fetch(`${BASE_URL}/api/health`, { method: 'GET' })
        .catch(() => {
            // Ignore any network errors, this is just a wake-up ping
        });
    }
  }, []);

  return null; // This component doesn't render anything visually
}
