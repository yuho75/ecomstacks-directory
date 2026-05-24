'use client';

import { useEffect } from 'react';

interface ClickTrackerProps {
  itemId: string;
}

/**
 * Silent background client component that fires a 'card_view' event 
 * once when the item detail page first mounts.
 */
export default function ItemViewTracker({ itemId }: ClickTrackerProps) {
  useEffect(() => {
    if (!itemId) return;

    // Fire-and-forget: track the card detail view on page load
    fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, type: 'card_view' }),
    }).catch(() => {
      // Silently ignore errors - never block the user experience
    });
  }, [itemId]);

  return null; // Renders nothing visually
}
