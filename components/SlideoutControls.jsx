import React, { useCallback } from "react";
import { useTheme } from "../providers/ThemeProvider";
import "./styles/layout.css";

export default function SlideoutControls({ open, toggleSlideout, tokensLeft, budget, mode, switchMode }) {
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleSwitchMode = useCallback(() => {
    switchMode(mode === "omega" ? "alpha" : "omega");
  }, [mode, switchMode]);

  return (
    <aside className={`slideout-controls ${open ? "open" : ""}`}>
      <button
        className="slideout-toggle"
        aria-label={open ? "Close controls" : "Open controls"}
        aria-expanded={open}
        onClick={toggleSlideout}
      >
        {open ? "Close" : "Controls"}
      </button>
      {open && (
        <div className="slideout-content" role="dialog" aria-label="Slideout Controls">
          <div className="control-section">
            <h4>Theme</h4>
            <button onClick={handleToggleTheme}>
              Switch to {theme === "light" ? "Dark" : "Light"} Mode
            </button>
          </div>
          <div className="control-section">
            <h4>Tokens</h4>
            <p>{tokensLeft} tokens left out of {budget}</p>
          </div>
          <div className="control-section">
            <h4>Mode</h4>
            <button onClick={handleSwitchMode}>
              Switch to {mode === "omega" ? "Alpha" : "Omega"} Mode
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
