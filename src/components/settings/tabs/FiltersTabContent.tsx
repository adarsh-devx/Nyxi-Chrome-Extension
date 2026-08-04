import React from 'react';
import { Sliders, Sun } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';

export const FiltersTabContent: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="max-w-[820px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <Sliders className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
          Background Visual Filters
        </h4>

        <div className="flex flex-col gap-2 mt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Backdrop Blur</span>
            <span className="text-white/50">{settings.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={settings.blur}
            onChange={(e) => updateSettings({ blur: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Background Brightness</span>
            <span className="text-white/50">{settings.brightness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={settings.brightness}
            onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <Sun className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
          Theme Mode & Animations
        </h4>

        <div className="flex items-center justify-between mt-1">
          <span className="text-white/80 text-xs font-medium">Color Theme</span>
          <div className="flex gap-2">
            {(['dark', 'light', 'system'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => updateSettings({ theme: m })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition-all ${
                  settings.theme === m
                    ? 'bg-[var(--accent-color,#8b5cf6)]/25 border-[var(--accent-color,#8b5cf6)] text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white/80 font-medium">Animation Speed</span>
            <span className="text-white/50">{settings.animationSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={settings.animationSpeed}
            onChange={(e) => updateSettings({ animationSpeed: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
