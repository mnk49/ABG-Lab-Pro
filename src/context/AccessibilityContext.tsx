"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isDyslexiaFriendly: boolean;
  toggleDyslexiaFriendly: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDyslexiaFriendly, setIsDyslexiaFriendly] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    const body = document.body;
    if (isDyslexiaFriendly) {
      body.classList.add('dyslexia-friendly');
    } else {
      body.classList.remove('dyslexia-friendly');
    }
  }, [isDyslexiaFriendly]);

  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  const toggleDyslexiaFriendly = () => setIsDyslexiaFriendly(prev => !prev);

  return (
    <AccessibilityContext.Provider value={{ isHighContrast, toggleHighContrast, isDyslexiaFriendly, toggleDyslexiaFriendly }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};