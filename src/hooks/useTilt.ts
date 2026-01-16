import { useState, useCallback, useRef, type MouseEvent } from 'react';

interface TiltValues {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface UseTiltOptions {
  max?: number;
  scale?: number;
  speed?: number;
}

/**
 * Hook for 3D tilt effect on hover
 * Returns handlers and style object for applying the effect
 */
export function useTilt(options: UseTiltOptions = {}) {
  const { max = 10, scale = 1.02, speed = 400 } = options;
  const [tilt, setTilt] = useState<TiltValues>({ rotateX: 0, rotateY: 0, scale: 1 });
  const ref = useRef<HTMLElement | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -max;
    const rotateY = ((x - centerX) / centerX) * max;

    setTilt({ rotateX, rotateY, scale });
  }, [max, scale]);

  const handleMouseEnter = useCallback(() => {
    setTilt(prev => ({ ...prev, scale }));
  }, [scale]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  const style = {
    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
  };

  return {
    ref,
    style,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

export default useTilt;
