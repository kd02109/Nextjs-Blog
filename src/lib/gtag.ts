/// <reference types="gtag.js" />

import { getPublicAnalyticsId } from '@/config/env';

export const GA_TRACKING_ID = getPublicAnalyticsId();

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: URL) => {
  if (!GA_TRACKING_ID) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (
  action: Gtag.EventNames,
  { event_category, event_label, value }: Gtag.EventParams,
) => {
  if (!GA_TRACKING_ID) return;

  window.gtag('event', action, {
    event_category,
    event_label,
    value,
  });
};
