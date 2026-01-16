"use client";

import { MoonStarIcon } from "@/components/tiptap-icons/moon-star-icon";
import { SunIcon } from "@/components/tiptap-icons/sun-icon";
import { Button } from "@/components/tiptap-ui-primitive/button";
import * as React from "react";

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);

  // Apply the theme to <html> when it changes
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // Optional: Remember user preference
  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false); // default to light
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      data-style="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  );
}
