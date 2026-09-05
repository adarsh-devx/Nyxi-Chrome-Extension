import React, { useState, useEffect } from 'react';
import { Plus, X, Folder, LayoutGrid, MousePointerClick } from 'lucide-react';
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

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const getFaviconUrl = (url: string): string =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(getHostname(url))}&sz=64`;

const countBookmarkLeaves = (nodes: ChromeBookmarkNode[]): number =>
  nodes.reduce(
    (sum, n) => sum + (n.url ? 1 : n.children ? countBookmarkLeaves(n.children) : 0),
    0
  );

const mockChromeBookmarks: ChromeBookmarkNode[] = [
  { id: 'b1', title: 'Dev Links', children: [
      { id: 'b1-1', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
      { id: 'b1-2', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    ]
  },
  { id: 'b2', title: 'Vite React', url: 'https://vite.dev' },
  { id: 'b3', title: 'Tailwind CSS', url: 'https://tailwindcss.com' },
];

/* Bump when defaultQuickLinks changes so saved lists get missing defaults merged in once */
const QUICK_LINKS_VERSION = 2;

export const LinksWidget: React.FC = () => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'quick' | 'bookmarks'>('quick');
  const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>([]);
  const [chromeBookmarks, setChromeBookmarks] = useState<ChromeBookmarkNode[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [failedFavicons, setFailedFavicons] = useState<Set<string>>(new Set());

  const handleFaviconError = (url: string) => {
    setFailedFavicons((prev) => new Set(prev).add(url));
  };

  // Load custom Quick Links
  useEffect(() => {
    const loadQuickLinks = async () => {
      const saved = await storage.get<QuickLinkItem[]>('quick_links', defaultQuickLinks);
      const savedVersion = await storage.get<number>('quick_links_version', 1);

      if (savedVersion < QUICK_LINKS_VERSION) {
        // Merge any missing default shortcuts (e.g. Gmail) into the saved list
        const merged = [...saved];
        for (const def of defaultQuickLinks) {
          const exists = merged.some(
            (l) => l.url.replace(/\/+$/, '') === def.url.replace(/\/+$/, '')
          );
          if (!exists) merged.push(def);
        }
        await storage.set('quick_links', merged);
        await storage.set('quick_links_version', QUICK_LINKS_VERSION);
        setQuickLinks(merged);
      } else {
        setQuickLinks(saved);
      }
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

  const renderBookmarkNode = (node: ChromeBookmarkNode) => {
    const nodeUrl = node.url;
    if (nodeUrl) {
      return (
        <a
          key={node.id}
          href={nodeUrl}
          className="flex items-center gap-3 p-3 rounded-xl glass-bookmark-row transition-all text-white text-sm"
        >
          <div className="w-6 h-6 rounded-lg favicon-box flex items-center justify-center flex-shrink-0">
            {failedFavicons.has(nodeUrl) ? (
              <span className="text-[10px] font-bold text-white/80">
                {node.title.charAt(0).toUpperCase()}
              </span>
            ) : (
              <img
                src={getFaviconUrl(nodeUrl)}
                alt=""
                loading="lazy"
                onError={() => handleFaviconError(nodeUrl)}
                className="w-4 h-4 rounded"
              />
            )}
          </div>
          <span className="truncate flex-1 font-medium">{node.title}</span>
          <span className="text-2xs text-white/30 flex-shrink-0">{getHostname(nodeUrl)}</span>
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
      {/* Widget Header: identity + segmented tabs */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="nyxi-links-icon w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-bold text-white truncate">Shortcuts & Bookmarks</h2>
            <span className="text-2xs font-semibold uppercase tracking-widest text-white/40">
              {activeTab === 'quick'
                ? `${quickLinks.length} saved`
                : `${countBookmarkLeaves(chromeBookmarks)} from Chrome`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {activeTab === 'quick' && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="nyxi-add-btn p-2 rounded-xl"
              title="Add Shortcut"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <div className="nyxi-segmented">
            <button
              onClick={() => setActiveTab('quick')}
              className={`nyxi-segmented-btn ${activeTab === 'quick' ? 'active' : ''}`}
            >
              Links
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`nyxi-segmented-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
            >
              Bookmarks
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <GlassCard className="nyxi-links-card overflow-y-auto custom-scrollbar">
        {activeTab === 'quick' &&
          (quickLinks.length === 0 ? (
            <div className="nyxi-empty-state py-8">
              <div className="nyxi-links-icon w-11 h-11 rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-white/80 mt-1">No shortcuts yet</p>
              <p className="text-xs text-white/40">Add your favourite sites for one-tap access</p>
              <button
                onClick={() => setIsAdding(true)}
                className="btn-accent mt-1.5 px-5 py-2 rounded-xl text-xs font-bold"
              >
                Add Shortcut
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {quickLinks.map((link, i) => (
                <a
                  key={link.id}
                  href={link.url}
                  title={link.title}
                  className="nyxi-tile-in group relative flex items-center justify-center p-2.5 rounded-2xl"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteLink(link.id, e)}
                    className="absolute -top-1.5 -right-1.5 z-10 p-1 rounded-full bg-black/60 border border-white/10 text-white/60 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-red-500/80 hover:text-white transition-all"
                    title="Remove Link"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <div className="w-8 h-8 rounded-full favicon-box flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {failedFavicons.has(link.url) ? (
                      <span className="text-xs font-bold text-white/90 uppercase">
                        {link.title.charAt(0)}
                      </span>
                    ) : (
                      <img
                        src={getFaviconUrl(link.url)}
                        alt={link.title}
                        loading="lazy"
                        onError={() => handleFaviconError(link.url)}
                        className="w-4-5 h-4-5 rounded-full"
                      />
                    )}
                  </div>
                </a>
              ))}
            </div>
          ))}

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
        <GlassCard className="nyxi-popover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 border border-[var(--accent-color)]/30 shadow-2xl nyxi-tile-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h3 className="text-white font-bold tracking-wider uppercase text-sm">Add New Shortcut</h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddLink} className="flex flex-col gap-3.5 mt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/60 text-xs font-semibold tracking-wider uppercase">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. YouTube"
                className="nyxi-input"
                autoFocus
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
                className="nyxi-input"
              />
            </div>

            <button
              type="submit"
              className="mt-1 py-2.5 rounded-xl font-bold text-white text-sm btn-accent"
            >
              Add Link
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  );
};
