import React, { useEffect, useState } from 'react';
import { Moon, Sun, Circle } from 'lucide-react';

const themes = [
  { key: 'light', label: 'Light', icon: <Sun className="w-5 h-5 text-yellow-500" /> },
  { key: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5 text-foreground dark:text-yellow-400" /> },
  { key: 'solarized', label: 'Solarized', icon: <Circle className="w-5 h-5 text-yellow-700" /> },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('theme') || 'light'
      : 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
    }
  }, []);

  const handleChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <select
      aria-label="Select theme"
      value={theme}
      onChange={handleChange}
      className="px-2 py-1 rounded border border-border bg-card text-foreground focus:outline-none focus:ring"
    >
      {themes.map((t) => (
        <option key={t.key} value={t.key}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
