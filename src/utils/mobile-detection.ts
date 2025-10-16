// src/utils/mobile-detection.ts
import { useEffect, useState } from 'react';

/**
 * Detects if the user is on a mobile device based on:
 * - User agent string
 * - Touch capability
 * - Screen size
 */
export function isMobileDevice(): boolean {
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
  ];
  const isMobileUA = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword)
  );

  // Check for touch capability
  const hasTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is IE-specific
    navigator.msMaxTouchPoints > 0;

  // Check screen size (mobile typically < 768px width)
  const isSmallScreen = window.innerWidth < 768;

  // Consider it mobile if it matches UA OR (has touch AND small screen)
  return isMobileUA || (hasTouch && isSmallScreen);
}

/**
 * React hook that detects mobile devices and updates on window resize
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileDevice());

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
