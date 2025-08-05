"use client";

import { UniversalAccess } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessibility } from "@/context/AccessibilityContext";

export function AccessibilityMenu() {
  const { 
    isHighContrast, 
    toggleHighContrast, 
    isDyslexiaFriendly, 
    toggleDyslexiaFriendly 
  } = useAccessibility();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-transparent dark:hover:bg-transparent transition-transform duration-200 ease-in-out hover:scale-110">
          <UniversalAccess className="h-[1.3rem] w-[1.3rem]" />
          <span className="sr-only">Toggle Accessibility Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Accessibility</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={isHighContrast}
          onCheckedChange={toggleHighContrast}
        >
          High Contrast
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isDyslexiaFriendly}
          onCheckedChange={toggleDyslexiaFriendly}
        >
          Dyslexia-Friendly Font
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}