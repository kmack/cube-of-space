// src/hooks/use-mobile-performance.ts
import { useEffect, useRef, useState } from 'react';
import { DEVICE_CAPS, PerformanceMonitor } from '../utils/device-detection';

export interface PerformanceState {
  fps: number;
  memoryPressure: boolean;
  shouldReduceQuality: boolean;
  isOptimized: boolean;
}

export function useMobilePerformance(): PerformanceState {
  const performanceMonitor = useRef(new PerformanceMonitor());
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    fps: 60,
    memoryPressure: false,
    shouldReduceQuality: false,
    isOptimized: false,
  });

  useEffect(() => {
    let animationId: number;
    let checkInterval: number;

    const updatePerformance = (): void => {
      const currentTime = performance.now();
      const fps = performanceMonitor.current.updateFPS(currentTime);
      const memoryPressure = performanceMonitor.current.checkMemoryPressure();
      const shouldReduceQuality = performanceMonitor.current.shouldReduceQuality();

      setPerformanceState(prev => ({
        ...prev,
        fps,
        memoryPressure,
        shouldReduceQuality,
      }));

      animationId = requestAnimationFrame(updatePerformance);
    };

    // Check performance every 5 seconds for optimization adjustments
    const checkOptimization = (): void => {
      const currentState = performanceMonitor.current;

      if (currentState.shouldReduceQuality() && !performanceState.isOptimized) {
        setPerformanceState(prev => ({ ...prev, isOptimized: true }));
        console.warn('📱 Mobile Performance: Enabling optimizations due to performance pressure');
      }
    };

    // Start monitoring only if we're on a mobile device
    if (DEVICE_CAPS.isMobile) {
      updatePerformance();
      checkInterval = window.setInterval(checkOptimization, 5000);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [performanceState.isOptimized]);

  // Memory cleanup on component unmount
  useEffect(() => {
    const currentMonitor = performanceMonitor.current;
    return () => {
      currentMonitor.reset();
    };
  }, []);

  return performanceState;
}

// Hook for adaptive quality settings
export function useAdaptiveQuality(): {
  performance: PerformanceState;
  getParticleCount: (baseCount: number) => number;
  getAnimationSpeed: (baseSpeed: number) => number;
  shouldShowFeature: (feature: 'particles' | 'labels' | 'grid' | 'helpers') => boolean;
} {
  const performance = useMobilePerformance();

  const getParticleCount = (baseCount: number): number => {
    if (performance.shouldReduceQuality || performance.isOptimized) {
      return Math.max(2, Math.floor(baseCount * 0.5));
    }
    return Math.min(baseCount, DEVICE_CAPS.maxParticles);
  };

  const getAnimationSpeed = (baseSpeed: number): number => {
    if (performance.shouldReduceQuality) {
      return baseSpeed * 0.5;
    }
    return baseSpeed;
  };

  const shouldShowFeature = (feature: 'particles' | 'labels' | 'grid' | 'helpers'): boolean => {
    if (DEVICE_CAPS.isLowEnd) return false;

    switch (feature) {
      case 'particles':
        return !performance.shouldReduceQuality;
      case 'labels':
        return !DEVICE_CAPS.isLowEnd;
      case 'grid':
      case 'helpers':
        return !DEVICE_CAPS.isMobile;
      default:
        return true;
    }
  };

  return {
    performance,
    getParticleCount,
    getAnimationSpeed,
    shouldShowFeature,
  };
}

// Emergency memory management
export function useMemoryManagement(): {
  forceGarbageCollection: () => void;
  checkMemoryPressure: () => boolean;
  getMemoryUsage: () => {
    used: number;
    total: number;
    limit: number;
    usageRatio: number;
  } | null;
} {
  const performanceRef = useRef(new PerformanceMonitor());

  const forceGarbageCollection = (): void => {
    // Trigger garbage collection if the API is available (Chrome DevTools)
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
  };

  const checkMemoryPressure = (): boolean => {
    return performanceRef.current.checkMemoryPressure();
  };

  const getMemoryUsage = (): {
    used: number;
    total: number;
    limit: number;
    usageRatio: number;
  } | null => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usageRatio: memory.usedJSHeapSize / memory.totalJSHeapSize,
      };
    }
    return null;
  };

  return {
    forceGarbageCollection,
    checkMemoryPressure,
    getMemoryUsage,
  };
}

// Global performance stats for debugging
declare global {
  interface Window {
    gc?: () => void;
    getCubePerformanceStats?: () => PerformanceState;
  }
}

// Export performance stats to global scope for debugging
export function enablePerformanceDebugging(): void {
  const monitor = new PerformanceMonitor();

  window.getCubePerformanceStats = () => ({
    fps: monitor.updateFPS(performance.now()),
    memoryPressure: monitor.checkMemoryPressure(),
    shouldReduceQuality: monitor.shouldReduceQuality(),
    isOptimized: DEVICE_CAPS.shouldReduceAnimations,
  });

  console.log('🔧 Performance debugging enabled. Use window.getCubePerformanceStats() to check status.');
}