import React from 'react';
import { Clock, Search } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';

export const WidgetsTabContent: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleWidgetToggle = (key: keyof typeof settings.widgetVisibility) => {
    updateSettings({
      widgetVisibility: {
        ...settings.widgetVisibility,
        [key]: !settings.widgetVisibility[key],
      },
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <Clock className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
          Clock & Date Settings
        </h4>

        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Show Clock Widget</span>
            <input
              type="checkbox"
              checked={settings.widgetVisibility.clock}
              onChange={() => handleWidgetToggle('clock')}
              className="w-4 h-4 accent-[var(--accent-color,#8b5cf6)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Time Format</span>
            <select
              value={settings.clockFormat}
              onChange={(e) => updateSettings({ clockFormat: e.target.value as '12h' | '24h' })}
              className="bg-black/30 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
            >
              <option value="12h">12-Hour (AM/PM)</option>
              <option value="24h">24-Hour</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Show Seconds</span>
            <input
              type="checkbox"
              checked={settings.showSeconds}
              onChange={(e) => updateSettings({ showSeconds: e.target.checked })}
              className="w-4 h-4 accent-[var(--accent-color,#8b5cf6)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Show Date</span>
            <input
              type="checkbox"
              checked={settings.showDate}
              onChange={(e) => updateSettings({ showDate: e.target.checked })}
              className="w-4 h-4 accent-[var(--accent-color,#8b5cf6)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <Search className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
          Search Bar & Shortcuts
        </h4>

        <div className="flex flex-col gap-3.5 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Show Search Bar</span>
            <input
              type="checkbox"
              checked={settings.widgetVisibility.search}
              onChange={() => handleWidgetToggle('search')}
              className="w-4 h-4 accent-[var(--accent-color,#8b5cf6)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Default Search Engine</span>
            <select
              value={settings.searchEngine}
              onChange={(e) => updateSettings({ searchEngine: e.target.value as any })}
              className="bg-black/30 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
            >
              <option value="google">Google</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="bing">Bing</option>
              <option value="brave">Brave</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Show Shortcuts & Bookmarks</span>
            <input
              type="checkbox"
              checked={settings.widgetVisibility.quickLinks}
              onChange={() => handleWidgetToggle('quickLinks')}
              className="w-4 h-4 accent-[var(--accent-color,#8b5cf6)] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs font-medium">Mouse Cursor Effect</span>
            <select
              value={settings.cursorEffect}
              onChange={(e) => updateSettings({ cursorEffect: e.target.value as any })}
              className="bg-black/30 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
            >
              <option value="none">Disabled</option>
              <option value="trail">Particle Trail</option>
              <option value="ripple">Interactive Ripple</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
