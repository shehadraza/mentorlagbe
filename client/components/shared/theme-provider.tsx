
"use client";

import { useCallback, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Theme = "light" | "dark" | "system";

type SettingsUpdatedEvent = CustomEvent<{
  appearance?: {
    theme?: Theme;
  };
}>;

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light"
  );

  localStorage.setItem("mentorlagbe-theme-preference", theme);
}

function isValidTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeRevision = useRef(0);

  const loadSavedTheme = useCallback(async () => {
    const requestRevision = themeRevision.current;

    const localTheme = localStorage.getItem(
      "mentorlagbe-theme-preference"
    );

    if (isValidTheme(localTheme)) {
      applyTheme(localTheme);
    }

    try {
      const tokenResult = await authClient.token();
      const token = tokenResult.data?.token;

      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/users/me/settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const result = await response.json();
      const savedTheme = result.settings?.appearance?.theme;

      if (
        result.success &&
        isValidTheme(savedTheme) &&
        themeRevision.current === requestRevision
      ) {
        applyTheme(savedTheme);
      }
    } catch {
      // Keep the currently applied theme if loading fails.
    }
  }, []);

  useEffect(() => {
    void loadSavedTheme();

    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as SettingsUpdatedEvent;
      const theme = customEvent.detail?.appearance?.theme;

      if (isValidTheme(theme)) {
        themeRevision.current += 1;
        applyTheme(theme);
      }
    };

    const handleSystemThemeChange = () => {
      const savedTheme = localStorage.getItem(
        "mentorlagbe-theme-preference"
      );

      if (savedTheme === "system") {
        applyTheme("system");
      }
    };

    window.addEventListener(
      "mentorlagbe:settings-updated",
      handleSettingsUpdate
    );

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      window.removeEventListener(
        "mentorlagbe:settings-updated",
        handleSettingsUpdate
      );

      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [loadSavedTheme]);

  return <>{children}</>;
}
