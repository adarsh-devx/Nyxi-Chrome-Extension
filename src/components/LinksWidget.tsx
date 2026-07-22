import React, { useState, useEffect } from 'react';
import { Plus, X, Globe, Folder } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { storage } from '../utils/storage';
import { GlassCard } from './GlassCard';

interface QuickLinkItem {
  id: string;
  title: string;
  url: string;
}

interface ChromeBookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: ChromeBookmarkNode[];
}

const defaultQuickLinks: QuickLinkItem[] = [
  { id: '1', title: 'YouTube', url: 'https://youtube.com' },
  { id: '2', title: 'GitHub', url: 'https://github.com' },
  { id: '3', title: 'Gmail', url: 'https://gmail.com' },
  { id: '4', title: 'Reddit', url: 'https://reddit.com' },
];

const mockChromeBookmarks: ChromeBookmarkNode[] = [
  { id: 'b1', title: 'Dev Links', children: [
      { id: 'b1-1', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
      { id: 'b1-2', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    ]
  },
  { id: 'b2', title: 'Vite React', url: 'https://vite.dev' },
  { id: 'b3', title: 'Tailwind CSS', url: 'https://tailwindcss.com' },
];

export const LinksWidget: React.FC = () => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'quick' | 'bookmarks'>('quick');
  const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>([]);
  const [chromeBookmarks, setChromeBookmarks] = useState<ChromeBookmarkNode[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loaded, setLoaded] = useState(false);

  // Load custom Quick Links
  useEffect(() => {
    const loadQuickLinks = async () => {
      const saved = await storage.get<QuickLinkItem[]>('quick_links', defaultQuickLinks);
      setQuickLinks(saved);
      setLoaded(true);
    };
    loadQuickLinks();
  }, []);

  // Save custom Quick Links
  const saveQuickLinks = async (updated: QuickLinkItem[]) => {
    setQuickLinks(updated);
    await storage.set('quick_links', updated);
  };

  // Fetch native Chrome Bookmarks
  useEffect(() => {
    const fetchBookmarks = () => {
      if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getTree) {
        chrome.bookmarks.getTree((tree: chrome.bookmarks.BookmarkTreeNode[]) => {
          const rootNode = tree[0];
          if (rootNode && rootNode.children) {
            const bar = rootNode.children.find((c: chrome.bookmarks.BookmarkTreeNode) => c.title.toLowerCase().includes('bar') || c.id === '1');
            const items = bar ? bar.children || [] : rootNode.children;
            setChromeBookmarks(items as ChromeBookmarkNode[]);
          }
        });
      } else {
        setChromeBookmarks(mockChromeBookmarks);
      }
    };

    if (activeTab === 'bookmarks') {
      fetchBookmarks();
    }
  }, [activeTab]);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newItem: QuickLinkItem = {
      id: String(Date.now()),
      title: newTitle.trim(),
      url: formattedUrl,
    };

    const updated = [...quickLinks, newItem];
    saveQuickLinks(updated);
    setNewTitle('');
    setNewUrl('');
    setIsAdding(false);
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = quickLinks.filter((item) => item.id !== id);
    saveQuickLinks(updated);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
    } catch {
      return '';
    }
  };

  const renderBookmarkNode = (node: ChromeBookmarkNode) => {
    if (node.url) {
      return (
        <a
          key={node.id}
          href={node.url}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/5 transition-all text-white text-sm"
        >
          <img
            src={getFaviconUrl(node.url)}
            alt=""
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
            className="w-5 h-5 rounded-md object-contain"
          />
          <span className="truncate flex-1 font-medium">{node.title}</span>
        </a>
      );
    }

    return (
      <div key={node.id} className="flex flex-col gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 px-3 py-2 text-white/50 text-xs font-semibold uppercase tracking-wider">
          <Folder className="w-4 h-4 text-[var(--accent-color)]" />
          <span className="truncate">{node.title}</span>
        </div>
        <div className="flex flex-col gap-1 pl-2">
          {node.children && node.children.map((child) => renderBookmarkNode(child))}
        </div>
      </div>
    );
  };

  if (!settings.widgetVisibility.quickLinks) return null;
  if (!loaded) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Navigation Headers */}
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('quick')}
            className={`text-sm font-semibold tracking-wider uppercase pb-1 border-b-2 transition-all ${
              activeTab === 'quick'
                ? 'border-[var(--accent-color)] text-white'
                : 'border-transparent text-white/45 hover:text-white/70'
            }`}
          >
            Quick Links
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`text-sm font-semibold tracking-wider uppercase pb-1 border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-[var(--accent-color)] text-white'
                : 'border-transparent text-white/45 hover:text-white/70'
            }`}
          >
            Bookmarks
          </button>
        </div>

        {activeTab === 'quick' && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Add Quick Link"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <GlassCard className="!p-4 min-h-[120px] max-h-[380px] overflow-y-auto custom-scrollbar">
        {activeTab === 'quick' && (
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                className="group relative flex flex-col items-center justify-center p-4 rounded-xl quick-link-tile text-center"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteLink(link.id, e)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 hover:bg-red-500/70 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove Link"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
                  <img
                    src={getFaviconUrl(link.url)}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sibling = e.currentTarget.nextElementSibling;
                      if (sibling) sibling.removeAttribute('style');
                    }}
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                  <Globe className="w-6 h-6 text-white/30 hidden" />
                </div>
                <span className="text-white/80 font-medium text-sm truncate w-full px-1">
                  {link.title}
                </span>
              </a>
            ))}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="grid grid-cols-1 gap-2.5">
            {chromeBookmarks.length > 0 ? (
              chromeBookmarks.map((node) => renderBookmarkNode(node))
            ) : (
              <div className="col-span-2 py-8 text-center text-white/40 text-sm">
                No bookmarks found in Bookmarks Bar
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Add Quick Link Popover Modal */}
      {isAdding && activeTab === 'quick' && (
        <GlassCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[360px] p-6 flex flex-col gap-4 border border-[var(--accent-color)]/30 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-white font-bold tracking-wider uppercase text-sm">Add New Link</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <form onSubmit={handleAddLink} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/60 text-xs font-semibold tracking-wider uppercase">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. YouTube"
                className="px-4 py-2 rounded-lg bg-slate-950/40 border border-white/10 outline-none text-white text-sm focus:border-[var(--accent-color)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-white/60 text-xs font-semibold tracking-wider uppercase">URL</label>
              <input
                type="text"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="e.g. youtube.com"
                className="px-4 py-2 rounded-lg bg-slate-950/40 border border-white/10 outline-none text-white text-sm focus:border-[var(--accent-color)]"
              />
            </div>

            <button
              type="submit"
              className="mt-2 py-2.5 rounded-lg font-bold text-white text-sm btn-accent"
            >
              Add Link
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  );
};
