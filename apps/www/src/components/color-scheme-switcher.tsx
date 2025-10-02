"use client";

import { Radio, RadioGroup } from "@headlessui/react";
import { DeviceDesktopIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import { useEffect, useState } from "react";

type ColorScheme = "system" | "light" | "dark";

const STORED_KEY_COLOR_SCHEME = "__COLOR_SCHEME";

const storedColorScheme = () =>
  (typeof window === "undefined"
    ? "system"
    : (localStorage.getItem(STORED_KEY_COLOR_SCHEME) ??
      "system")) as ColorScheme;

const applyColorScheme = (value: ColorScheme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(
    value === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : value,
  );
};

if (typeof window !== "undefined") {
  applyColorScheme(storedColorScheme());
}

export default function ColorSchemeSwitcher() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("system");

  const handleChangeColorScheme = (value: ColorScheme) => {
    setColorScheme(value);
    applyColorScheme(value);
    localStorage.setItem(STORED_KEY_COLOR_SCHEME, value);
  };

  useEffect(() => {
    setColorScheme(storedColorScheme());
  }, []);

  useEffect(() => {
    const prefersColorScheme = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    const handlePrefersColorSchemeChange = (e: MediaQueryListEvent) => {
      if (colorScheme === "system") {
        applyColorScheme(e.matches ? "dark" : "light");
      }
    };
    prefersColorScheme.addEventListener(
      "change",
      handlePrefersColorSchemeChange,
    );
    return () =>
      prefersColorScheme.removeEventListener(
        "change",
        handlePrefersColorSchemeChange,
      );
  }, [colorScheme]);

  return (
    <RadioGroup
      className="flex gap-1 p-0.5 rounded-2xl bg-gray-100 dark:bg-white/10"
      value={colorScheme}
      onChange={handleChangeColorScheme}
      aria-label="색상 모드 선택"
    >
      {(["system", "light", "dark"] as ColorScheme[]).map((option) => (
        <Radio
          key={option}
          value={option}
          className="p-1 border-none rounded-2xl data-checked:bg-gray-300 data-checked:dark:bg-gray-600"
          aria-label={option}
        >
          {option === "system" ? (
            <DeviceDesktopIcon size={12} className="m-0.5" />
          ) : option === "light" ? (
            <SunIcon size={12} className="m-0.5" />
          ) : (
            <MoonIcon size={12} className="m-0.5" />
          )}
        </Radio>
      ))}
    </RadioGroup>
  );
}
