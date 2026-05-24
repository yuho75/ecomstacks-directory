'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Generate a temporary browser session ID if it doesn't exist in this tab session
    let sessionId = sessionStorage.getItem('ecomstacks_analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('ecomstacks_analytics_session_id', sessionId);
    }

    const trackVisit = async () => {
      try {
        // Do not track admin path pageviews to avoid inflating statistics with owner actions
        if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

        await fetch('/api/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pathname,
            sessionId,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
            referer: typeof document !== 'undefined' ? document.referrer : '',
          }),
        });
      } catch (err) {
        console.error('Failed to log visit silently:', err);
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // Silent background tracker
}
