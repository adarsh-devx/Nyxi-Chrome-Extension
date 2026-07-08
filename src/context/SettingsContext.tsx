import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  animationSpeed: number; // multiplier (e.g. 1 = normal, 0.5 = fast, 0 = none)
  blur: number; // px (0 to 20)
  brightness: number; // percentage (20 to 100)
  glassOpacity: number; // opacity (0.1 to 0.9)
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
  accentColor: '#8b5cf6', // Indigo/violet accent
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

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await storage.get<AppSettings>('app_settings', defaultSettings);
      // Merge with defaultSettings to ensure future added keys are present
      setSettings({ ...defaultSettings, ...saved });
      setLoaded(true);
    };
    loadSettings();
  }, []);

  // Save settings when changed
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storage.set('app_settings', updated);
      return updated;
    });
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    await storage.set('app_settings', defaultSettings);
  };

  // Apply settings to document styles dynamically
  useEffect(() => {
    if (!loaded) return;

    const root = document.documentElement;

    // Apply colors and theme custom custom styling variables
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-color-rgb', hexToRgb(settings.accentColor));
    root.style.setProperty('--bg-blur', `${settings.blur}px`);
    root.style.setProperty('--bg-brightness', `${settings.brightness}%`);
    root.style.setProperty('--glass-opacity', `${settings.glassOpacity}`);
    root.style.setProperty('--anim-duration', `${0.3 * settings.animationSpeed}s`);

    // Handle Theme class toggles
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

  // Listen to system theme changes if system theme is selected
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

  if (!loaded) {
    // Prevent flash of unstyled content during load
    return null;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
