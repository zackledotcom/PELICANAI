// ThemeProvider.jsx — Manages light/dark theme logic and emotion-based palette modulation
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const detectUserPref = () =>
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const emotionPalette = {
  neutral: {
    light: "#FFFFFF",
    dark: "#1C1C1E",
  },
  distress: {
    light: "#FDF6F6",
    dark: "#2C1C1C",
  },
  calm: {
    light: "#F0FAFF",
    dark: "#1A1A2E",
  },
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(detectUserPref());
  const [emotion, setEmotion] = useState("neutral");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = emotionPalette[emotion][theme];
  }, [theme, emotion]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, emotion, setEmotion }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
