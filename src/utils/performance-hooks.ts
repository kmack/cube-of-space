// src/utils/performance-hooks.ts
import { useEffect, useRef, useState } from 'react';

import { APP_CONFIG } from '../config/app-config';

/**
 * Tracks page visibility using the Page Visibility API
 * Returns true when the page is visible, false when hidden/backgrounded
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(
    () => !document.hidden // Initialize based on current state
  );

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

/**
 * Detects user idle state with configurable timeout
 * Returns true when user is active, false after timeout period of inactivity
 *
 * @param timeoutMs - Milliseconds of inactivity before considering user idle
 */
export function useIdleDetection(
  timeoutMs: number = APP_CONFIG.performance.idleTimeoutMs
): boolean {
  const [isActive, setIsActive] = useState<boolean>(true);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const resetTimeout = (): void => {
      // Clear existing timeout
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }

      // Set user as active
      setIsActive(true);

      // Set new timeout for idle detection
      timeoutRef.current = window.setTimeout(() => {
        setIsActive(false);
      }, timeoutMs);
    };

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ];

    // Reset timeout on any activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });

    // Initialize timeout
    resetTimeout();

    return () => {
      // Cleanup
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [timeoutMs]);

  return isActive;
}

/**
 * Combined hook for animation control
 * Returns true when animations should run (page visible AND user active)
 *
 * @param idleTimeoutMs - Milliseconds before considering user idle
 */
export function useAnimationActive(idleTimeoutMs: number = 10000): boolean {
  const isVisible = usePageVisibility();
  const isActive = useIdleDetection(idleTimeoutMs);

  return isVisible && isActive;
}

/**
 * Hook for throttling useFrame updates on mobile devices
 * Returns a function that returns true when the frame should be processed
 *
 * @param isMobile - Whether the device is mobile
 * @param targetFPS - Target FPS for mobile
 */
export function useFrameThrottle(
  isMobile: boolean,
  targetFPS: number = APP_CONFIG.performance.mobileTargetFPS
): () => boolean {
  const frameCountRef = useRef<number>(0);
  const skipFrames = Math.round(60 / targetFPS) - 1; // For 30fps: skip 1 frame

  return (): boolean => {
    if (!isMobile) {
      return true; // Always process on desktop
    }

    frameCountRef.current++;
    return frameCountRef.current % (skipFrames + 1) === 0;
  };
}

/**
 * Performance monitor hook for debugging
 * Logs FPS and frame time statistics
 */
export function usePerformanceMonitor(enabled: boolean = false): void {
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const logIntervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) return;

    const logStats = (): void => {
      if (frameTimesRef.current.length === 0) return;

      const times = frameTimesRef.current;
      const avgFrameTime = times.reduce((a, b) => a + b, 0) / times.length;
      const fps = 1000 / avgFrameTime;
      const maxFrameTime = Math.max(...times);
      const minFrameTime = Math.min(...times);

      console.debug('[Performance]', {
        avgFPS: fps.toFixed(1),
        avgFrameTime: avgFrameTime.toFixed(2) + 'ms',
        minFrameTime: minFrameTime.toFixed(2) + 'ms',
        maxFrameTime: maxFrameTime.toFixed(2) + 'ms',
        samples: times.length,
      });

      frameTimesRef.current = [];
    };

    logIntervalRef.current = window.setInterval(logStats, 5000); // Log every 5 seconds

    return () => {
      if (logIntervalRef.current !== undefined) {
        window.clearInterval(logIntervalRef.current);
      }
    };
  }, [enabled]);

  // This would be called in useFrame hooks
  // Exposed for components that want to track their performance
  useEffect(() => {
    if (!enabled) return;

    const trackFrame = (): void => {
      const now = performance.now();
      const frameTime = now - lastTimeRef.current;
      frameTimesRef.current.push(frameTime);
      lastTimeRef.current = now;
    };

    // Could be connected to RAF for global monitoring
    const rafId = requestAnimationFrame(function measure() {
      trackFrame();
      requestAnimationFrame(measure);
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);
}
