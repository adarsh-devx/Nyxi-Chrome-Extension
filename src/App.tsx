import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { WallpaperRenderer } from './components/WallpaperRenderer';
import { ClockWidget } from './components/ClockWidget';
import { SearchWidget } from './components/SearchWidget';
import { LinksWidget } from './components/LinksWidget';
import { CursorTrail } from './components/CursorTrail';
import { SettingsDrawer } from './components/settings/SettingsDrawer';
import { User, Search, LayoutGrid, Settings, HelpCircle, X } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 text-white overflow-x-hidden font-sans select-none">
      {/* 1. Dynamic Wallpaper Background */}
      <WallpaperRenderer />

      {/* 2. Interactive Cursor trail overlay */}
      <CursorTrail />

      {/* 3. Left Center Sidebar Pill Dock */}
      <div className="sidebar-dock animate-fade-in">
        {/* Profile Button */}
        <button
          className="sidebar-btn"
          onClick={() => setIsInfoOpen(true)}
          title="Nyxi Profile Info"
        >
          <User className="w-5 h-5" />
        </button>

        {/* Central Search Toggle Button */}
        <button
          className={`sidebar-btn ${isSearchOpen ? 'sidebar-btn-active' : ''}`}
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (isLinksOpen) setIsLinksOpen(false);
            setIsSettingsOpen(false);
          }}
          title="Toggle Search Widget"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Links / Bookmarks Toggle Button */}
        <button
          className={`sidebar-btn ${isLinksOpen ? 'sidebar-btn-active' : ''}`}
          onClick={() => {
            setIsLinksOpen(!isLinksOpen);
            if (isSearchOpen) setIsSearchOpen(false);
            setIsSettingsOpen(false);
          }}
          title="Toggle Shortcuts & Bookmarks"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Global Configuration Panel Button */}
        <button
          className={`sidebar-btn ${isSettingsOpen ? 'sidebar-btn-active' : ''}`}
          onClick={() => {
            setIsSettingsOpen(!isSettingsOpen);
            setIsSearchOpen(false);
            setIsLinksOpen(false);
          }}
          title="Preferences & Styles"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Quick Information / Help Button */}
        <button
          className="sidebar-btn"
          onClick={() => setIsInfoOpen(true)}
          title="Help & Shortcuts"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* 4. Clock Widget (Snaps to Top-Right via absolute card CSS rule) */}
      <ClockWidget />

      {/* 5. Left Panel for Active Widgets (Toggled from Sidebar) */}
      {(isSearchOpen || isLinksOpen) && (
        <main className="left-panel animate-fade-in">
          {/* Toggleable Central Search Bar */}
          {isSearchOpen && <SearchWidget />}

          {/* Toggleable Quick Links / Bookmarks Bar */}
          {isLinksOpen && <LinksWidget />}
        </main>
      )}

      {/* 6. Settings Panel Sliding Drawer Drawer */}
      <SettingsDrawer isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />

      {/* 7. Centered Glass About / Information Overlay */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsInfoOpen(false)} />
          <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-2xl max-w-md w-full mx-4 text-center animate-fade-in">
            <button
              onClick={() => setIsInfoOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/30 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[var(--accent-color)]" />
            </div>
            <h2 className="text-xl font-bold mb-1">Nyxi Tab</h2>
            <p className="text-xs text-[var(--accent-color)] font-semibold uppercase tracking-widest mb-4">Workspace Custom Dashboard</p>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">
              Nyxi Tab is a premium, high-performance browser extension that transforms your default screen into a personal workspace dashboard. Use the sidebar icons to access search engines, shortcuts, and background wallpapers.
            </p>
            <div className="text-xs text-white/40 border-t border-white/5 pt-4">
              Version 1.0.0 • Made with Google DeepMind
            </div>
          </div>
        </div>
      )}

      {/* 8. Invisible spacing footer */}
      <footer className="w-full pointer-events-none opacity-0 py-1" />
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <WallpaperProvider>
        <DashboardContent />
      </WallpaperProvider>
    </SettingsProvider>
  );
}

export default App;
