// src/utils/device-detection.ts
export interface DeviceCapabilities {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isLowEnd: boolean;
  maxParticles: number;
  shouldReduceAnimations: boolean;
  maxDPR: number;
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const userAgent = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);

  // Detect low-end devices based on various indicators
  const isLowEnd = (() => {
    // Memory API (if available)
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory && deviceMemory <= 2) return true;

    // Hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency;
    if (cores && cores <= 2) return true;

    // iOS device model detection for older devices
    if (isIOS) {
      const isOldIOS = /OS [5-9]_/i.test(userAgent);
      const isOldDevice = /iPhone[1-6]|iPad[1-4]/i.test(userAgent);
      if (isOldIOS || isOldDevice) return true;
    }

    // Android version check for older devices
    if (isAndroid) {
      const androidVersion = userAgent.match(/Android (\d+)/);
      if (androidVersion && parseInt(androidVersion[1]) < 8) return true;
    }

    return false;
  })();

  // Calculate performance parameters based on device capabilities
  const maxParticles = (() => {
    if (isLowEnd) return 2;
    if (isMobile) return 4;
    return 8;
  })();

  const maxDPR = (() => {
    if (isLowEnd) return 1;
    if (isMobile) return Math.min(window.devicePixelRatio, 1.5);
    return Math.min(window.devicePixelRatio, 2);
  })();

  const shouldReduceAnimations = isLowEnd || (isMobile && window.devicePixelRatio > 2);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isLowEnd,
    maxParticles,
    shouldReduceAnimations,
    maxDPR,
  };
}

// Create a singleton instance
export const DEVICE_CAPS = detectDeviceCapabilities();

// Performance monitoring utilities
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private memoryWarnings = 0;

  updateFPS(currentTime: number): number {
    this.frameCount++;
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    return this.fps;
  }

  checkMemoryPressure(): boolean {
    // Check if performance API is available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const usedRatio = memory.usedJSHeapSize / memory.totalJSHeapSize;

      if (usedRatio > 0.8) {
        this.memoryWarnings++;
        return true;
      }
    }
    return false;
  }

  shouldReduceQuality(): boolean {
    return this.fps < 30 || this.memoryWarnings > 3;
  }

  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.memoryWarnings = 0;
  }
}