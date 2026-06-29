// src/hooks/useTheme.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme, setTheme } from "../store/uiSlice";

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return {
    theme,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (t: "light" | "dark") => dispatch(setTheme(t)),
    isDark: theme === "dark",
  };
};