import React, { useState } from 'react';
import { Settings, X, Sliders, Monitor, Trash2, RotateCcw, Palette, Layout, Download, Upload } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import type { AppSettings } from '../../context/SettingsContext';
import { WallpaperTab } from './WallpaperTab';
import { storage } from '../../utils/storage';

const presetColors = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Pink', value: '#ec4899' },
];

interface SettingsDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, setIsOpen }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'style' | 'widgets' | 'data'>('wallpaper');

  const handleAccentSelect = (color: string) => {
    updateSettings({ accentColor: color });
  };

  const handleWidgetToggle = (key: keyof AppSettings['widgetVisibility']) => {
    updateSettings({
      widgetVisibility: {
        ...settings.widgetVisibility,
        [key]: !settings.widgetVisibility[key],
      },
    });
  };

  // Configuration Import/Export
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "nyxi_settings.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          updateSettings(parsed as Partial<AppSettings>);
          alert('Settings imported successfully!');
        }
      } catch (err) {
        alert('Invalid settings file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Slide-out Settings Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Click-Close Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px] transition-opacity"
          />

          {/* Settings Panel Container */}
          <div
            className="settings-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--accent-color)]" />
                <h3 className="text-white font-bold tracking-wider uppercase text-sm">Dashboard Settings</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex border-b border-white/5 bg-slate-950/20">
              <button
                onClick={() => setActiveTab('wallpaper')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-1 border-b-2 ${
                  activeTab === 'wallpaper'
                    ? 'border-[var(--accent-color)] text-white bg-white/5'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Wallpaper
              </button>

              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-1 border-b-2 ${
                  activeTab === 'style'
                    ? 'border-[var(--accent-color)] text-white bg-white/5'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <Palette className="w-4 h-4" />
                Filters
              </button>

              <button
                onClick={() => setActiveTab('widgets')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-1 border-b-2 ${
                  activeTab === 'widgets'
                    ? 'border-[var(--accent-color)] text-white bg-white/5'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <Layout className="w-4 h-4" />
                Widgets
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex flex-col items-center gap-1 border-b-2 ${
                  activeTab === 'data'
                    ? 'border-[var(--accent-color)] text-white bg-white/5'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Data
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {/* WALLPAPER TAB */}
              {activeTab === 'wallpaper' && <WallpaperTab />}

              {/* FILTERS & STYLE TAB */}
              {activeTab === 'style' && (
                <div className="flex flex-col gap-6">
                  {/* Theme Mode */}
                  <div>
                    <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Theme Mode</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['dark', 'light', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => updateSettings({ theme: t })}
                          className={`py-2 px-3 border rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                            settings.theme === t
                              ? 'bg-[var(--accent-color)] border-transparent text-white shadow-lg shadow-[var(--accent-color)]/25'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Palette */}
                  <div>
                    <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Accent Color</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleAccentSelect(color.value)}
                          style={{ backgroundColor: color.value }}
                          className={`w-full aspect-square rounded-full border-2 transition-transform hover:scale-110 active:scale-[0.9] flex items-center justify-center ${
                            settings.accentColor === color.value
                              ? 'border-white scale-105 shadow-lg'
                              : 'border-transparent'
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                    {/* Custom Hex Color */}
                    <div className="flex items-center gap-3 mt-3">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => handleAccentSelect(e.target.value)}
                        className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => handleAccentSelect(e.target.value)}
                        placeholder="#ffffff"
                        maxLength={7}
                        className="px-3 py-1-5 rounded-lg bg-slate-950/40 border border-white/10 outline-none text-white text-xs font-mono uppercase focus:border-[var(--accent-color)] flex-1"
                      />
                    </div>
                  </div>

                  {/* Sliders (Blur, Opacity, Brightness) */}
                  <div className="flex flex-col gap-5 border-t border-white/5 pt-5">
                    {/* Background Blur */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-white/60">Glass Blur</span>
                        <span className="text-white/95 font-mono">{settings.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={settings.blur}
                        onChange={(e) => updateSettings({ blur: Number(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    {/* Wallpaper Brightness */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-white/60">Wallpaper Brightness</span>
                        <span className="text-white/95 font-mono">{settings.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={settings.brightness}
                        onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    {/* Glassmorphism Opacity */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-white/60">Glass Opacity</span>
                        <span className="text-white/95 font-mono">{settings.glassOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={settings.glassOpacity}
                        onChange={(e) => updateSettings({ glassOpacity: Number(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    {/* Animation speed multiplier */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-white/60">Animation Speed</span>
                        <span className="text-white/95 font-mono">
                          {settings.animationSpeed === 0 ? 'None' : `${settings.animationSpeed}x`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.5"
                        value={settings.animationSpeed}
                        onChange={(e) => updateSettings({ animationSpeed: Number(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WIDGETS TAB */}
              {activeTab === 'widgets' && (
                <div className="flex flex-col gap-6">
                  {/* Visibility Toggles */}
                  <div>
                    <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Widget Visibility</h4>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <span className="text-white/80 font-medium text-sm">Clock Widget</span>
                        <input
                          type="checkbox"
                          checked={settings.widgetVisibility.clock}
                          onChange={() => handleWidgetToggle('clock')}
                          className="w-4 h-4 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)] bg-slate-900 border-white/10 accent-[var(--accent-color)]"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <span className="text-white/80 font-medium text-sm">Search Bar</span>
                        <input
                          type="checkbox"
                          checked={settings.widgetVisibility.search}
                          onChange={() => handleWidgetToggle('search')}
                          className="w-4 h-4 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)] bg-slate-900 border-white/10 accent-[var(--accent-color)]"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <span className="text-white/80 font-medium text-sm">Bookmarks & Links</span>
                        <input
                          type="checkbox"
                          checked={settings.widgetVisibility.quickLinks}
                          onChange={() => handleWidgetToggle('quickLinks')}
                          className="w-4 h-4 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)] bg-slate-900 border-white/10 accent-[var(--accent-color)]"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Clock Formats */}
                  {settings.widgetVisibility.clock && (
                    <div className="border-t border-white/5 pt-5">
                      <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Clock Format</h4>
                      <div className="flex flex-col gap-3">
                        {/* Time format selector */}
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm font-medium">Use 24-Hour Format</span>
                          <input
                            type="checkbox"
                            checked={settings.clockFormat === '24h'}
                            onChange={(e) => updateSettings({ clockFormat: e.target.checked ? '24h' : '12h' })}
                            className="w-4 h-4 accent-[var(--accent-color)] cursor-pointer"
                          />
                        </div>
                        {/* Show seconds selector */}
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm font-medium">Show Seconds</span>
                          <input
                            type="checkbox"
                            checked={settings.showSeconds}
                            onChange={(e) => updateSettings({ showSeconds: e.target.checked })}
                            className="w-4 h-4 accent-[var(--accent-color)] cursor-pointer"
                          />
                        </div>
                        {/* Show date selector */}
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm font-medium">Show Calendar Date</span>
                          <input
                            type="checkbox"
                            checked={settings.showDate}
                            onChange={(e) => updateSettings({ showDate: e.target.checked })}
                            className="w-4 h-4 accent-[var(--accent-color)] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Engine Settings */}
                  {settings.widgetVisibility.search && (
                    <div className="border-t border-white/5 pt-5 flex flex-col gap-3">
                      <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-1">Search Engine</h4>
                      <select
                        value={settings.searchEngine}
                        onChange={(e) =>
                          updateSettings({
                            searchEngine: e.target.value as AppSettings['searchEngine'],
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 outline-none text-white text-sm focus:border-[var(--accent-color)]"
                      >
                        <option value="google">Google</option>
                        <option value="duckduckgo">DuckDuckGo</option>
                        <option value="bing">Bing</option>
                        <option value="brave">Brave</option>
                        <option value="custom">Custom URL</option>
                      </select>

                      {/* Custom Search URL field */}
                      {settings.searchEngine === 'custom' && (
                        <div className="flex flex-col gap-1-5 mt-1">
                          <label className="text-white/40 text-tiny uppercase font-bold tracking-widest">
                            Custom Search URL (%s = search query)
                          </label>
                          <input
                            type="text"
                            value={settings.customSearchUrl}
                            onChange={(e) => updateSettings({ customSearchUrl: e.target.value })}
                            placeholder="https://example.com/search?q=%s"
                            className="px-3 py-2 rounded-lg bg-slate-950/40 border border-white/10 outline-none text-white text-xs focus:border-[var(--accent-color)]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom Cursor Selection */}
                  <div className="border-t border-white/5 pt-5">
                    <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Cursor Effect</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: 'none', label: 'None' },
                        { key: 'trail', label: 'Magic Trail' },
                        { key: 'magnetic', label: 'Magnetic Ring' },
                        { key: 'ripple', label: 'Click Ripple' },
                      ] as const).map((effect) => (
                        <button
                          key={effect.key}
                          onClick={() => updateSettings({ cursorEffect: effect.key })}
                          className={`py-2 px-3 border rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                            settings.cursorEffect === effect.key
                              ? 'bg-[var(--accent-color)] border-transparent text-white shadow-lg'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                          }`}
                        >
                          {effect.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* DATA MANAGEMENT TAB */}
              {activeTab === 'data' && (
                <div className="flex flex-col gap-6">
                  {/* Configuration Sync */}
                  <div>
                    <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Backup Configuration</h4>
                    <div className="flex flex-col gap-3">
                      {/* Export settings */}
                      <button
                        onClick={handleExport}
                        className="py-2.5 px-4 bg-white/5 border border-white/10 hover:border-white/20 text-white hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4 text-[var(--accent-color)]" />
                        Export Preferences
                      </button>

                      {/* Import settings */}
                      <label className="py-2.5 px-4 bg-white/5 border border-white/10 hover:border-white/20 text-white hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                        <Upload className="w-4 h-4 text-[var(--accent-color)]" />
                        Import Preferences
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Reset Actions */}
                  <div className="border-t border-white/5 pt-5">
                    <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Reset & Defaults</h4>
                    <div className="flex flex-col gap-3">
                      {/* Reset all configurations */}
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to reset all configurations? Custom wallpapers will be preserved, but themes, widgets position, and search layouts will reset.')) {
                            resetSettings();
                          }
                        }}
                        className="py-2.5 px-4 bg-red-950/20 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 text-red-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Preferences
                      </button>

                      {/* Full factory clean */}
                      <button
                        onClick={async () => {
                          if (confirm('CAUTION: This will perform a full factory reset. It will delete all custom uploaded wallpapers, shortcuts, and preferences. Proceed?')) {
                            await storage.remove('custom_wallpapers');
                            await storage.remove('quick_links');
                            await storage.remove('active_wallpaper_id');
                            resetSettings();
                            window.location.reload();
                          }
                        }}
                        className="py-2.5 px-4 bg-red-500/10 border border-red-500/35 hover:bg-red-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Custom Library & Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
