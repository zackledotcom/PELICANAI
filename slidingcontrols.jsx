// SlideoutControls.jsx — Additional front-end controls slideout panel
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

const SlideoutControls = () => {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-200 dark:bg-gray-800 rounded-full p-2 shadow hover:scale-105 transition"
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <div className="mt-2 p-4 rounded-xl shadow-xl bg-white dark:bg-zinc-900 w-64 transition-all">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Controls</h3>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
            <button
              onClick={toggleTheme}
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              {theme === "light" ? "Dark" : "Light"} Mode
            </button>
          </div>

          {/* Extend with more toggles as needed */}
        </div>
      )}
    </div>
  );
};

export default SlideoutControls;
