import { useEffect, useState } from "react";

export function useDarkMode() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem("interviewpilot_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", enabled);
    localStorage.setItem("interviewpilot_theme", enabled ? "dark" : "light");
  }, [enabled]);

  return { enabled, setEnabled };
}
