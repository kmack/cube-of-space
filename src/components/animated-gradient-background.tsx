import { type FC, useEffect, useRef } from 'react';

export const AnimatedGradientBackground: FC = () => {
  const animationIdRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize start time inside useEffect to avoid impure function call during render
    startTimeRef.current ??= Date.now();

    const animate = (): void => {
      const now = Date.now();
      const elapsed = (now - (startTimeRef.current ?? 0)) / 1000; // seconds

      // Oscillation parameters with different frequencies for subtle variation
      const time1 = elapsed * 0.3; // slow oscillation
      const time2 = elapsed * 0.2; // slower oscillation
      const time3 = elapsed * 0.25; // medium oscillation

      // Base gray tones with subtle variations
      const baseGray1 = Math.round(45 + Math.sin(time1) * 8); // ~37-53
      const baseGray2 = Math.round(35 + Math.cos(time2) * 6); // ~29-41
      const baseGray3 = Math.round(55 + Math.sin(time3 * 1.3) * 10); // ~45-65

      // Gradient positions that slowly drift (as percentages)
      const point1X = 50 + Math.sin(time1 * 0.7) * 20; // center +/- 20%
      const point1Y = 50 + Math.cos(time1 * 0.5) * 20;

      const point2X = 50 + Math.sin(time2 * 0.8 + Math.PI * 0.66) * 25;
      const point2Y = 50 + Math.cos(time2 * 0.6 + Math.PI * 0.66) * 25;

      const point3X = 50 + Math.sin(time3 * 0.6 + Math.PI * 1.33) * 18;
      const point3Y = 50 + Math.cos(time3 * 0.7 + Math.PI * 1.33) * 18;

      // Create CSS radial gradients
      const gradient = `
        radial-gradient(circle at ${point1X}% ${point1Y}%,
          rgba(${baseGray1}, ${baseGray1}, ${baseGray1}, 0.8) 0%,
          rgba(${baseGray1}, ${baseGray1}, ${baseGray1}, 0) 70%),
        radial-gradient(circle at ${point2X}% ${point2Y}%,
          rgba(${baseGray2}, ${baseGray2}, ${baseGray2}, 0.7) 0%,
          rgba(${baseGray2}, ${baseGray2}, ${baseGray2}, 0) 60%),
        radial-gradient(circle at ${point3X}% ${point3Y}%,
          rgba(${baseGray3}, ${baseGray3}, ${baseGray3}, 0.6) 0%,
          rgba(${baseGray3}, ${baseGray3}, ${baseGray3}, 0) 80%),
        linear-gradient(0deg, rgb(25, 25, 25) 0%, rgb(25, 25, 25) 100%)
      `;

      document.body.style.backgroundImage = gradient;

      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Set initial background
    document.body.style.backgroundColor = 'rgb(25, 25, 25)';
    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      // Clean up - reset to original background
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};
