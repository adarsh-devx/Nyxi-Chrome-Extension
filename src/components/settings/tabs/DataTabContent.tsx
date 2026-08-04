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
    <div className="max-w-[820px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <Database className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
          Backup & Restore Preferences
        </h4>
        <p className="nyxi-card-subtitle">Export or import your complete dashboard customization JSON file.</p>

        <div className="nyxi-data-btn-group">
          <button
            type="button"
            onClick={handleExport}
            className="nyxi-data-btn"
          >
            <Download className="w-4 h-4 text-[var(--accent-color,#8b5cf6)] flex-shrink-0" />
            <span>Export JSON</span>
          </button>

          <label className="nyxi-data-btn">
            <Upload className="w-4 h-4 text-[var(--accent-color,#8b5cf6)] flex-shrink-0" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="nyxi-card-section">
        <h4 className="nyxi-card-title">
          <RotateCcw className="w-4 h-4 text-red-400" />
          Reset & Factory Defaults
        </h4>

        <div className="nyxi-data-btn-group">
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to reset all configurations to default specifications?')) {
                resetSettings();
              }
            }}
            className="nyxi-data-btn-danger-light"
          >
            <RotateCcw className="w-4 h-4 flex-shrink-0" />
            <span>Reset Preferences</span>
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
            className="nyxi-data-btn-danger-strong"
          >
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            <span>Factory Reset Everything</span>
          </button>
        </div>
      </div>
    </div>
  );
};
