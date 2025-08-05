"use client";

import * as React from "react";
import { Moon, Sun, Contrast, Type, Check, Accessibility as AccessibilityIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAccessibility } from "@/contexts/AccessibilityContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function AccessibilityMenu() {
  const { theme, setTheme } = useTheme();
  const { isLexendFont, toggleLexendFont } = useAccessibility();

  const isHighContrast = theme?.includes("-hc") ?? false;
  const baseTheme = theme?.replace("-hc", "") ?? "system";

  const handleHighContrastToggle = (checked: boolean) => {
    if (checked) {
      setTheme(`${baseTheme}-hc`);
    } else {
      setTheme(baseTheme);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    if (isHighContrast) {
      setTheme(`${newTheme}-hc`);
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <AccessibilityIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme and accessibility settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {baseTheme === 'light' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {baseTheme === 'dark' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>System</span>
          {baseTheme === 'system' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Label htmlFor="high-contrast-mode" className="flex items-center justify-between w-full cursor-pointer">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              High Contrast
            </div>
            <Switch
              id="high-contrast-mode"
              checked={isHighContrast}
              onCheckedChange={handleHighContrastToggle}
            />
          </Label>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Label htmlFor="dyslexia-font-mode" className="flex items-center justify-between w-full cursor-pointer">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Dyslexia Friendly Font
            </div>
            <Switch
              id="dyslexia-font-mode"
              checked={isLexendFont}
              onCheckedChange={toggleLexendFont}
            />
          </Label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}