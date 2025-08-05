"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  isLexendFont: boolean;
  toggleLexendFont: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLexendFont, setIsLexendFont] = useState(false);

  useEffect(() => {
    const isEnabled = localStorage.getItem('lexendFontEnabled') === 'true';
    setIsLexendFont(isEnabled);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('font-lexend', isLexendFont);
    localStorage.setItem('lexendFontEnabled', String(isLexendFont));
  }, [isLexendFont]);

  const toggleLexendFont = () => {
    setIsLexendFont(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider value={{ isLexendFont, toggleLexendFont }}>
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