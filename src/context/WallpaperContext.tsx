import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { wallpaperDB } from '../utils/wallpaperDB';

export interface WallpaperItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'dynamic';
  url: string; // empty string for custom wallpapers stored in IndexedDB
  isCustom?: boolean;
}

const presetWallpapers: WallpaperItem[] = [
  {
    id: 'nature',
    name: 'Serene Lake',
    type: 'image',
    url: '/default_wallpapers/nature.png',
  },
  {
    id: 'cyberpunk',
    name: 'Cyber Rain',
    type: 'image',
    url: '/default_wallpapers/cyberpunk.png',
  },
  {
    id: 'abstract',
    name: 'Luxury Waves',
    type: 'image',
    url: '/default_wallpapers/abstract.png',
  },
  {
    id: 'dynamic-particles',
    name: 'Ambient Stars (Dynamic)',
    type: 'dynamic',
    url: '',
  },
];

interface WallpaperContextType {
  wallpapers: WallpaperItem[];
  activeWallpaper: WallpaperItem;
  isVideoPlaying: boolean;
  isVideoMuted: boolean;
  shouldLoop: boolean;
  isShuffleEnabled: boolean;
  setActiveWallpaperById: (id: string) => void;
  uploadWallpaper: (file: File) => Promise<void>;
  deleteWallpaper: (id: string) => void;
  setVideoPlaying: (playing: boolean) => void;
  setVideoMuted: (muted: boolean) => void;
  setShouldLoop: (loop: boolean) => void;
  setShuffleEnabled: (shuffle: boolean) => void;
  triggerRandomWallpaper: () => void;
  getWallpaperUrl: (wp: WallpaperItem) => string;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customWallpapers, setCustomWallpapers] = useState<WallpaperItem[]>([]);
  const [activeWallpaperId, setActiveWallpaperId] = useState<string>('nature');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [shouldLoop, setShouldLoop] = useState<boolean>(true);
  const [isShuffleEnabled, setShuffleEnabled] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [resolvedUrlsMap, setResolvedUrlsMap] = useState<Record<string, string>>({});

  // Combine presets and custom wallpapers
  const wallpapers = [...presetWallpapers, ...customWallpapers];
  const activeWallpaper = wallpapers.find((w) => w.id === activeWallpaperId) || presetWallpapers[0];

  // Load from storage on mount
  useEffect(() => {
    const loadWallpapers = async () => {
      const savedCustom = await storage.get<WallpaperItem[]>('custom_wallpapers', []);
      const savedActiveId = await storage.get<string>('active_wallpaper_id', 'nature');
      const savedMuted = await storage.get<boolean>('wallpaper_video_muted', true);
      const savedLoop = await storage.get<boolean>('wallpaper_video_loop', true);
      const savedShuffle = await storage.get<boolean>('wallpaper_shuffle_enabled', false);

      setCustomWallpapers(savedCustom);
      setVideoMuted(savedMuted);
      setShouldLoop(savedLoop);
      setShuffleEnabled(savedShuffle);

      if (savedShuffle) {
        // Pick a random wallpaper on tab load if shuffle is enabled
        const all = [...presetWallpapers, ...savedCustom];
        const randomItem = all[Math.floor(Math.random() * all.length)];
        setActiveWallpaperId(randomItem.id);
      } else {
        setActiveWallpaperId(savedActiveId);
      }
      setLoaded(true);
    };

    loadWallpapers();
  }, []);

  // Dynamically resolve custom blob URLs and manage memory allocation
  useEffect(() => {
    if (!loaded) return;

    const urlsMap: Record<string, string> = {};
    let isSubscribed = true;

    const resolveAll = async () => {
      for (const wp of customWallpapers) {
        try {
          const blob = await wallpaperDB.get(wp.id);
          if (blob && isSubscribed) {
            urlsMap[wp.id] = URL.createObjectURL(blob);
          }
        } catch (e) {
          console.error('Error resolving thumbnail:', e);
        }
      }
      if (isSubscribed) {
        setResolvedUrlsMap(urlsMap);
      }
    };

    resolveAll();

    return () => {
      isSubscribed = false;
      // Revoke all created URLs to avoid memory leaks
      Object.values(urlsMap).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [customWallpapers, loaded]);

  const getWallpaperUrl = (wp: WallpaperItem): string => {
    if (wp.isCustom) {
      return resolvedUrlsMap[wp.id] || '';
    }
    return wp.url;
  };

  const setActiveWallpaperById = async (id: string) => {
    setActiveWallpaperId(id);
    await storage.set('active_wallpaper_id', id);
  };

  const uploadWallpaper = async (file: File): Promise<void> => {
    const id = `custom-${Date.now()}`;
    const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

    // Store binary file directly in IndexedDB
    await wallpaperDB.save(id, file);

    const newItem: WallpaperItem = {
      id,
      name: file.name.split('.')[0] || 'Uploaded Media',
      type,
      url: '', // url is resolved at runtime from IndexedDB
      isCustom: true,
    };

    const updated = [...customWallpapers, newItem];
    setCustomWallpapers(updated);
    await storage.set('custom_wallpapers', updated);
    await setActiveWallpaperById(id);
  };

  const deleteWallpaper = async (id: string) => {
    const updated = customWallpapers.filter((w) => w.id !== id);
    setCustomWallpapers(updated);
    await storage.set('custom_wallpapers', updated);

    // Delete binary file from IndexedDB
    await wallpaperDB.delete(id);

    // If the active wallpaper was deleted, switch back to default
    if (activeWallpaperId === id) {
      await setActiveWallpaperById('nature');
    }
  };

  const setVideoPlaying = (playing: boolean) => {
    setIsVideoPlaying(playing);
  };

  const setVideoMuted = async (muted: boolean) => {
    setIsVideoMuted(muted);
    await storage.set('wallpaper_video_muted', muted);
  };

  const setShouldLoopState = async (loop: boolean) => {
    setShouldLoop(loop);
    await storage.set('wallpaper_video_loop', loop);
  };

  const setShuffleEnabledState = async (shuffle: boolean) => {
    setShuffleEnabled(shuffle);
    await storage.set('wallpaper_shuffle_enabled', shuffle);
  };

  const triggerRandomWallpaper = () => {
    const filterPresets = wallpapers.filter((w) => w.id !== activeWallpaperId);
    if (filterPresets.length === 0) return;
    const randomItem = filterPresets[Math.floor(Math.random() * filterPresets.length)];
    setActiveWallpaperId(randomItem.id);
  };

  if (!loaded) return null;

  return (
    <WallpaperContext.Provider
      value={{
        wallpapers,
        activeWallpaper,
        isVideoPlaying,
        isVideoMuted,
        shouldLoop,
        isShuffleEnabled,
        setActiveWallpaperById,
        uploadWallpaper,
        deleteWallpaper,
        setVideoPlaying,
        setVideoMuted,
        setShouldLoop: setShouldLoopState,
        setShuffleEnabled: setShuffleEnabledState,
        triggerRandomWallpaper,
        getWallpaperUrl,
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
};
