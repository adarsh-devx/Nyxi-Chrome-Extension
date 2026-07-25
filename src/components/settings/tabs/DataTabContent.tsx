import React from 'react';
import { Database, Download, Upload, RotateCcw, Trash2 } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { wallpaperDB } from '../../../utils/wallpaperDB';
import { storage } from '../../../utils/storage';

export const DataTabContent: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', 'nyxi_settings.json');
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          updateSettings(parsed);
          alert('Settings imported successfully!');
        }
      } catch {
        alert('Invalid settings file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <Database className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
          Backup & Restore Preferences
        </h4>
        <p className="nyxi-card-subtitle">Export or import your complete dashboard customization JSON file.</p>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            type="button"
            onClick={handleExport}
            className="py-2.5 px-4 bg-white/5 border border-white/10 hover:border-white/20 text-white hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
            Export JSON
          </button>

          <label className="py-2.5 px-4 bg-white/5 border border-white/10 hover:border-white/20 text-white hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
            <Upload className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <RotateCcw className="w-4 h-4 text-red-400" />
          Reset & Factory Defaults
        </h4>

        <div className="flex flex-col gap-3 mt-1">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all configurations to default specifications?')) {
                resetSettings();
              }
            }}
            className="py-2.5 px-4 bg-red-950/20 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 text-red-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Preferences
          </button>

          <button
            type="button"
            onClick={async () => {
              if (confirm('CAUTION: This will perform a full factory reset. It will delete all custom uploaded wallpapers, shortcuts, and preferences. Proceed?')) {
                await wallpaperDB.clearStore();
                await storage.remove('custom_wallpapers');
                await storage.remove('quick_links');
                await storage.remove('active_wallpaper_id');
                resetSettings();
                window.location.reload();
              }
            }}
            className="py-2.5 px-4 bg-red-500/10 border border-red-500/35 hover:bg-red-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-red-200 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Factory Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};
