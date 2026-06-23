"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";

/** Inline script (runs before paint in <head>) to set the theme with no flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('ca-theme');if(t!=='light'&&t!=='dark'){t=new URLSearchParams(location.search).get('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}var e=document.documentElement;e.classList.toggle('dark',t==='dark');e.style.colorScheme=t;}catch(e){}})();`;

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync the toggle icon to the class the no-flash head script already applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    const el = document.documentElement;
    el.classList.toggle("dark", next === "dark");
    el.style.colorScheme = next;
    try {
      localStorage.setItem("ca-theme", next);
    } catch {}
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={
        mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"
      }
      className="grid h-9 w-9 place-items-center rounded-[var(--radius)] border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
    >
      {/* Both rendered; CSS shows the right one to avoid hydration flicker */}
      <SunIcon width={17} height={17} className="hidden dark:block" />
      <MoonIcon width={17} height={17} className="block dark:hidden" />
    </button>
  );
}
