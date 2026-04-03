"use client";

import { useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type BrandTheme =
  | "cherry-rose"
  | "legacy-purple"
  | "dark-teal"
  | "rosewood"
  | "prussian-blue"
  | "harvest-orange"
  | "coffee-cinnabar";

const THEME_STORAGE_KEY = "sortres-theme";
const BRAND_THEME_STORAGE_KEY = "sortres-brand-theme";
export const DEFAULT_BRAND_THEME: BrandTheme = "cherry-rose";

export const BRAND_THEME_OPTIONS: Array<{ value: BrandTheme; label: string }> = [
  { value: "cherry-rose", label: "Cherry Rose" },
  { value: "legacy-purple", label: "Legacy Purple" },
  { value: "dark-teal", label: "Dark Teal" },
  { value: "rosewood", label: "Rosewood" },
  { value: "prussian-blue", label: "Prussian Blue" },
  { value: "harvest-orange", label: "Harvest Orange" },
  { value: "coffee-cinnabar", label: "Coffee Cinnabar" },
];

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemePreference) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

function isBrandTheme(value: string | null): value is BrandTheme {
  if (!value) {
    return false;
  }

  return BRAND_THEME_OPTIONS.some((option) => option.value === value);
}

function applyBrandTheme(theme: BrandTheme) {
  document.documentElement.setAttribute("data-brand-theme", theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "system";
    }
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" || savedTheme === "dark" || savedTheme === "system" ? savedTheme : "system";
  });
  const [brandTheme, setBrandThemeState] = useState<BrandTheme>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_BRAND_THEME;
    }

    const savedBrandTheme = localStorage.getItem(BRAND_THEME_STORAGE_KEY);
    return isBrandTheme(savedBrandTheme) ? savedBrandTheme : DEFAULT_BRAND_THEME;
  });
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() =>
    typeof window === "undefined" ? "light" : getSystemTheme()
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyBrandTheme(brandTheme);
  }, [brandTheme]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const nextSystemTheme = media.matches ? "dark" : "light";
      setSystemTheme(nextSystemTheme);
      document.documentElement.classList.toggle("dark", nextSystemTheme === "dark");
    };

    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  const setBrandTheme = (nextBrandTheme: BrandTheme) => {
    setBrandThemeState(nextBrandTheme);
    localStorage.setItem(BRAND_THEME_STORAGE_KEY, nextBrandTheme);
    applyBrandTheme(nextBrandTheme);
  };

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    return theme === "system" ? systemTheme : theme;
  }, [theme, systemTheme]);

  return { theme, resolvedTheme, setTheme, brandTheme, setBrandTheme };
}
