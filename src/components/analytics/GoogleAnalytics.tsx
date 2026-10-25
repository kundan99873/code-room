import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const location = useLocation();
  const initialized = useRef(false);

  // Read from prop or env variable
  const gaId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;

  // 1. Initialize Google Tag script once
  useEffect(() => {
    if (!gaId || initialized.current) return;

    // Avoid loading duplicate script
    const existingScript = document.querySelector(
      `script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", gaId, {
        send_page_view: false, // Handle SPA route page_views manually below
      });

      initialized.current = true;
    }
  }, [gaId]);

  // 2. Track virtual pageviews on React Router route changes
  useEffect(() => {
    if (!gaId || !window.gtag) return;

    const pagePath = location.pathname + location.search;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [gaId, location]);

  return null;
}
