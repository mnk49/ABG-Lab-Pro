"use client";

import React, { useState, useEffect, useRef } from 'react';

// Define the VANTA object on the window for TypeScript
declare global {
  interface Window {
    VANTA: {
      CELLS: (options: {
        el: HTMLElement | string;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        scale?: number;
        color1?: number;
        color2?: number;
        size?: number;
        speed?: number;
      }) => {
        destroy: () => void;
      };
    };
  }
}

const VantaBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current && window.VANTA) {
      setVantaEffect(
        window.VANTA.CELLS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          color1: 0xfa1717,
          color2: 0xc51212,
          size: 1.20,
          speed: 0.80
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div ref={vantaRef} className="min-h-screen w-full relative">
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default VantaBackground;