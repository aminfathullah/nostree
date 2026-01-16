import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

/**
 * ThemeToggle - Animated theme switcher with system preference support
 * Persists preference to localStorage and syncs with system changes
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('nostree-theme') as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (newTheme !== 'system') {
      root.classList.add(newTheme);
    }
    // For system preference, we rely on the CSS media query
  };

  const cycleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    localStorage.setItem('nostree-theme', next);
    applyTheme(next);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-card border border-border">
        <div className="w-4 h-4" />
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-card border border-border hover:bg-card-hover hover:border-border-hover transition-colors"
      title={`Theme: ${theme} (click to change)`}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'system' ? (
          <Monitor className="w-4 h-4 text-txt-muted" />
        ) : theme === 'dark' ? (
          <Moon className="w-4 h-4 text-brand" />
        ) : (
          <Sun className="w-4 h-4 text-warning" />
        )}
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;
