/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { storage } from '../utils/storage';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  animationSpeed: number;
  blur: number;
  brightness: number;
  glassOpacity: number;
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  showDate: boolean;
  searchEngine: 'google' | 'duckduckgo' | 'bing' | 'brave' | 'custom';
  customSearchUrl: string;
  widgetVisibility: {
    clock: boolean;
    search: boolean;
    quickLinks: boolean;
  };
  cursorEffect: 'none' | 'trail' | 'magnetic' | 'ripple';
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#8b5cf6',
  animationSpeed: 1,
  blur: 8,
  brightness: 75,
  glassOpacity: 0.25,
  clockFormat: '12h',
  showSeconds: false,
  showDate: true,
  searchEngine: 'google',
  customSearchUrl: '',
  widgetVisibility: {
    clock: true,
    search: true,
    quickLinks: true,
  },
  cursorEffect: 'none',
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const hexToRgb = (hex: string): string => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '139, 92, 246';
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  const pendingSettingsRef = useRef<AppSettings | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await storage.get<AppSettings>('app_settings', defaultSettings);
      const merged = { ...defaultSettings, ...saved };
      setSettings(merged);
      pendingSettingsRef.current = merged;
      setLoaded(true);
    };
    loadSettings();
  }, []);

  // Flush pending debounced writes immediately
  const flushPendingWrite = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (pendingSettingsRef.current) {
      storage.set('app_settings', pendingSettingsRef.current);
    }
  }, []);

  // Ensure un-persisted slider edits are written on unload or tab hide
  useEffect(() => {
    const handleUnloadOrHide = () => {
      if (document.hidden) {
        flushPendingWrite();
      }
    };

    window.addEventListener('beforeunload', flushPendingWrite);
    document.addEventListener('visibilitychange', handleUnloadOrHide);

    return () => {
      window.removeEventListener('beforeunload', flushPendingWrite);
      document.removeEventListener('visibilitychange', handleUnloadOrHide);
      flushPendingWrite();
    };
  }, [flushPendingWrite]);

  // Update settings with immediate UI state update & 300ms debounced storage persistence
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      pendingSettingsRef.current = updated;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (pendingSettingsRef.current) {
          storage.set('app_settings', pendingSettingsRef.current);
        }
      }, 300);

      return updated;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSettings(defaultSettings);
    pendingSettingsRef.current = defaultSettings;
    await storage.set('app_settings', defaultSettings);
  }, []);

  // Apply CSS custom properties dynamically
  useEffect(() => {
    if (!loaded) return;

    const root = document.documentElement;
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-color-rgb', hexToRgb(settings.accentColor));
    root.style.setProperty('--bg-blur', `${settings.blur}px`);
    root.style.setProperty('--bg-brightness', `${settings.brightness}%`);
    root.style.setProperty('--glass-opacity', `${settings.glassOpacity}`);
    root.style.setProperty('--anim-duration', `${0.3 * settings.animationSpeed}s`);

    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [settings, loaded]);

  // Listen to system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings]
  );

  if (!loaded) return null;

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
