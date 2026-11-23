
"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

type SettingsUpdatedEvent = CustomEvent<{
  appearance?: {
    theme?: Theme;
  };
}>;

const THEME_STORAGE_KEY = "mentorlagbe-theme-preference";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function isValidTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // First visit defaults to Light Mode.
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (isValidTheme(savedTheme)) {
      applyTheme(savedTheme);
    } else {
      applyTheme("light");
    }

    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as SettingsUpdatedEvent;
      const theme = customEvent.detail?.appearance?.theme;

      if (isValidTheme(theme)) {
        applyTheme(theme);
      }
    };

    window.addEventListener(
      "mentorlagbe:settings-updated",
      handleSettingsUpdate
    );

    return () => {
      window.removeEventListener(
        "mentorlagbe:settings-updated",
        handleSettingsUpdate
      );
    };
  }, []);

  return <>{children}</>;
}
