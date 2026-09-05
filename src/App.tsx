import React, { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { WallpaperRenderer } from './components/WallpaperRenderer';
import { ClockWidget } from './components/ClockWidget';
import { SearchWidget } from './components/SearchWidget';
import { LinksWidget } from './components/LinksWidget';
import { SettingsDrawer } from './components/settings/SettingsDrawer';
import ProfileModal from './components/ProfileModal';
import { User, Search, LayoutGrid, Settings, HelpCircle } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 text-white overflow-x-hidden font-sans select-none">
      {/* 1. Dynamic Wallpaper Background */}
      <WallpaperRenderer />

      {/* 2. Left Center Sidebar Pill Dock */}
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

      {/* 7. Centered Glass Profile / Help Overlay (reconstructed from dist build) */}
      <ProfileModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

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
