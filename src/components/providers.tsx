"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Level = "child" | "junior" | "developer";

interface ThemeCtx {
  theme: "light" | "dark";
  toggle: () => void;
}

interface LevelCtx {
  level: Level;
  setLevel: (l: Level) => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });
const LevelContext = createContext<LevelCtx>({ level: "developer", setLevel: () => {} });

export const useTheme = () => useContext(ThemeContext);
export const useLearner = () => useContext(LevelContext);

const THEME_KEY = "git-in-depth-theme";
const LEVEL_KEY = "git-in-depth-level";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return stored ?? (prefersDark ? "dark" : "light");
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

const LEVELS: Array<{ value: Level; label: string }> = [
  { value: "child", label: "Child" },
  { value: "junior", label: "Junior" },
  { value: "developer", label: "Developer" },
];

export const LEVEL_OPTIONS = LEVELS;

export function LevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<Level>(() => {
    if (typeof window === "undefined") return "developer";
    const stored = window.localStorage.getItem(LEVEL_KEY) as Level | null;
    return stored && LEVELS.some((l) => l.value === stored) ? stored : "developer";
  });

  const setLevel = useCallback((l: Level) => {
    setLevelState(l);
    window.localStorage.setItem(LEVEL_KEY, l);
  }, []);

  return <LevelContext.Provider value={{ level, setLevel }}>{children}</LevelContext.Provider>;
}