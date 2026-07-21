'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { MoonStar, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [flash, setFlash] = useState<'light-to-dark' | 'dark-to-light' | null>(null);
  const flashRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      const flashType = next === 'dark' ? 'light-to-dark' : 'dark-to-light';
      
      // 触发 flash 效果
      setFlash(flashType);
      if (flashRef.current) clearTimeout(flashRef.current);
      flashRef.current = setTimeout(() => setFlash(null), 600);

      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* 主题切换 flash 遮罩 */}
      {flash && (
        <div
          className={`theme-flash ${flash}`}
          style={{ opacity: flash ? 1 : 0 }}
        />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl
        bg-surface hover:bg-surface-hover
        border border-border-light
        text-text-tertiary hover:text-text-primary
        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        active:scale-90
        focus:outline-none focus:ring-2 focus:ring-brand-500/40
        group"
      aria-label={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
    >
      <Sun className={`w-4 h-4 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        theme === 'light'
          ? 'opacity-100 rotate-0 scale-100'
          : 'opacity-0 rotate-180 scale-0'
      }`} />
      <MoonStar className={`w-4 h-4 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        theme === 'dark'
          ? 'opacity-100 rotate-0 scale-100'
          : 'opacity-0 -rotate-180 scale-0'
      }`} />
      {/* 悬浮光晕 */}
      <span className={`absolute inset-0 rounded-xl bg-brand-500/5 transition-all duration-300 ${
        hover ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`} />
    </button>
  );
}
