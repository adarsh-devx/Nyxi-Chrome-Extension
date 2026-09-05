import React, { useEffect, useState } from 'react';
import { User, X, Heart, Globe, LayoutGrid, Image as ImageIcon, Palette } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { storage } from '../utils/storage';

/* Reconstructed from dist build (index-5gDDfhYp.js) — Nyxi Profile Info / Help & Shortcuts modal */

const PROFILE_FEATURES = [
  { icon: Globe, title: 'Smart Search', desc: 'Multi-engine web search' },
  { icon: LayoutGrid, title: 'Quick Links', desc: 'Shortcuts & bookmarks' },
  { icon: ImageIcon, title: 'Live Wallpapers', desc: 'Shader-animated scenes' },
  { icon: Palette, title: 'Style & Filters', desc: 'Glass, glow & accents' },
];

const getExtensionVersion = (): string => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      return chrome.runtime.getManifest().version;
    }
  } catch {
    // ignore
  }
  return '1.0.2';
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettings();
  const [shortcutCount, setShortcutCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      storage.get<unknown[]>('quick_links', []).then((links) => setShortcutCount(links.length));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const searchEngine =
    settings.searchEngine === 'custom'
      ? 'Custom'
      : settings.searchEngine.charAt(0).toUpperCase() + settings.searchEngine.slice(1);
  const theme = settings.theme === 'system' ? 'System' : settings.theme === 'dark' ? 'Dark' : 'Light';

  return (
    <div className="nyxi-profile-overlay" onClick={onClose}>
      <div className="nyxi-profile-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="nyxi-profile-close" onClick={onClose} title="Close">
          <X className="w-4 h-4" />
        </button>

        <div className="nyxi-profile-hero">
          <div className="nyxi-profile-avatar">
            <User className="w-8 h-8" />
          </div>
          <h2 className="nyxi-profile-name">Nyxi Tab</h2>
          <span className="nyxi-profile-badge">v{getExtensionVersion()}</span>
          <p className="nyxi-profile-tagline">Workspace Custom Dashboard</p>
        </div>

        <div className="nyxi-profile-stats">
          <div className="nyxi-profile-stat">
            <span className="nyxi-profile-stat-value">{shortcutCount}</span>
            <span className="nyxi-profile-stat-label">Shortcuts</span>
          </div>
          <div className="nyxi-profile-stat-divider" />
          <div className="nyxi-profile-stat">
            <span className="nyxi-profile-stat-value">{searchEngine}</span>
            <span className="nyxi-profile-stat-label">Search Engine</span>
          </div>
          <div className="nyxi-profile-stat-divider" />
          <div className="nyxi-profile-stat">
            <span className="nyxi-profile-stat-value">{theme}</span>
            <span className="nyxi-profile-stat-label">Theme</span>
          </div>
        </div>

        <p className="nyxi-profile-section-label">What's Inside</p>
        <div className="nyxi-profile-features">
          {PROFILE_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div className="nyxi-profile-feature" key={title}>
              <div className="nyxi-profile-feature-icon">
                <Icon className="w-4 h-4" />
              </div>
              <div className="nyxi-profile-feature-text">
                <span className="nyxi-profile-feature-title">{title}</span>
                <span className="nyxi-profile-feature-desc">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="nyxi-profile-footer">
          <span className="nyxi-profile-made">
            Made with <Heart className="w-3 h-3 nyxi-profile-heart" /> for a calmer new tab
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;