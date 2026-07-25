import React, { useState, useEffect, useRef } from 'react';
import './SettingsModal.css';
import { Settings, X, Image as ImageIcon, Box, Sparkles, BarChart3 } from 'lucide-react';
import type { SettingsTabKey } from '../../types/settingsUI';
import { WallpaperTabContent } from './tabs/WallpaperTabContent';
import { WidgetsTabContent } from './tabs/WidgetsTabContent';
import { FiltersTabContent } from './tabs/FiltersTabContent';
import { DataTabContent } from './tabs/DataTabContent';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS: { key: SettingsTabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'wallpaper', label: 'WALLPAPER', icon: <ImageIcon className="w-4 h-4" /> },
  { key: 'widgets', label: 'WIDGETS', icon: <Box className="w-4 h-4" /> },
  { key: 'filters', label: 'FILTERS', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'data', label: 'DATA', icon: <BarChart3 className="w-4 h-4" /> },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('wallpaper');
  const [isContentReady, setIsContentReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Keep the opening frame light; mount the heavy tab content after the shell animates in.
  useEffect(() => {
    if (!isOpen) {
      setIsContentReady(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsContentReady(true);
    }, 190);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Focus Restore: Capture activeElement when modal opens, restore on close.
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        containerRef.current?.focus({ preventScroll: true });
      });
    } else if (previousActiveElementRef.current && document.body.contains(previousActiveElementRef.current)) {
      previousActiveElementRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Focus Trap & Keyboard Navigation (Escape, Tab cycling, Arrow Left/Right)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const currentIndex = TABS.findIndex((t) => t.key === activeTab);
        if (currentIndex !== -1) {
          const nextIndex =
            e.key === 'ArrowRight'
              ? (currentIndex + 1) % TABS.length
              : (currentIndex - 1 + TABS.length) % TABS.length;
          setActiveTab(TABS[nextIndex].key);
        }
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="nyxi-settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      {/* Backdrop */}
      <div className="nyxi-settings-backdrop" onClick={onClose} />

      {/* Main Glass Modal Container */}
      <div ref={containerRef} className="nyxi-settings-container custom-scrollbar" tabIndex={-1}>
        {/* Header */}
        <header className="nyxi-settings-header">
          <div className="nyxi-settings-title" id="settings-modal-title">
            <Settings className="w-5 h-5 text-[var(--accent-color,#8b5cf6)]" />
            <span>DASHBOARD SETTINGS</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Dashboard Settings"
            className="nyxi-settings-close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Navigation Tabs Bar */}
        <nav className="nyxi-tabs-bar" role="tablist" aria-label="Settings Categories">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`nyxi-tab-item ${isActive ? 'active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content Panes */}
        <main className="w-full" id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {isContentReady ? (
            <>
              {activeTab === 'wallpaper' && <WallpaperTabContent />}
              {activeTab === 'widgets' && <WidgetsTabContent />}
              {activeTab === 'filters' && <FiltersTabContent />}
              {activeTab === 'data' && <DataTabContent />}
            </>
          ) : (
            <div className="nyxi-settings-panel-placeholder" aria-hidden="true" />
          )}
        </main>
      </div>
    </div>
  );
};
