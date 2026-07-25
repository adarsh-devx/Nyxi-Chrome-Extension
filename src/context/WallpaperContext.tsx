/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storage } from '../utils/storage';
import { wallpaperDB } from '../utils/wallpaperDB';

export interface WallpaperItem {
  id: string;
  name: string;
  type: 'image' | 'video';
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

  // Combine presets and custom wallpapers with useMemo
  const wallpapers = useMemo(() => [...presetWallpapers, ...customWallpapers], [customWallpapers]);
  const activeWallpaper = useMemo(
    () => wallpapers.find((w: WallpaperItem) => w.id === activeWallpaperId) || presetWallpapers[0],
    [wallpapers, activeWallpaperId]
  );

  // Load from storage & preload presets on mount
  useEffect(() => {
    // Preload default preset wallpaper images into browser cache instantly
    presetWallpapers.forEach((wp) => {
      if (wp.url) {
        const img = new Image();
        img.src = wp.url;
      }
    });

    const loadWallpapers = async () => {
      const savedCustom = await storage.get<WallpaperItem[]>('custom_wallpapers', []);
      const validCustom: WallpaperItem[] = [];

      for (const item of savedCustom) {
        if (item.isCustom) {
          const hasBlob = await wallpaperDB.hasWallpaper(item.id);
          if (hasBlob) {
            validCustom.push(item);
          }
        }
      }

      if (validCustom.length !== savedCustom.length) {
        await storage.set('custom_wallpapers', validCustom);
      }

      const savedActiveId = await storage.get<string>('active_wallpaper_id', 'nature');
      const savedMuted = await storage.get<boolean>('wallpaper_video_muted', true);
      const savedLoop = await storage.get<boolean>('wallpaper_video_loop', true);
      const savedShuffle = await storage.get<boolean>('wallpaper_shuffle_enabled', false);

      setCustomWallpapers(validCustom);
      setIsVideoMuted(savedMuted);
      setShouldLoop(savedLoop);
      setShuffleEnabled(savedShuffle);

      const all = [...presetWallpapers, ...validCustom];
      const activeExists = all.some((w) => w.id === savedActiveId);

      if (savedShuffle && all.length > 0) {
        const randomItem = all[Math.floor(Math.random() * all.length)];
        setActiveWallpaperId(randomItem.id);
      } else if (activeExists) {
        setActiveWallpaperId(savedActiveId);
      } else {
        setActiveWallpaperId('nature');
        await storage.set('active_wallpaper_id', 'nature');
      }
      setLoaded(true);
    };

    loadWallpapers();
  }, []);

  // Parallelize custom blob URL resolution on app start
  useEffect(() => {
    if (!loaded) return;

    let isSubscribed = true;
    let createdUrlsMap: Record<string, string> = {};

    const resolveAll = async () => {
      const entries = await Promise.all(
        customWallpapers.map(async (wp) => {
          try {
            const blob = await wallpaperDB.get(wp.id);
            if (blob && isSubscribed) {
              return [wp.id, URL.createObjectURL(blob)] as const;
            }
          } catch (e) {
            console.error('Error resolving thumbnail:', e);
          }
          return null;
        })
      );

      if (isSubscribed) {
        const urlsMap: Record<string, string> = {};
        entries.forEach((entry) => {
          if (entry) urlsMap[entry[0]] = entry[1];
        });
        createdUrlsMap = urlsMap;
        setResolvedUrlsMap(urlsMap);
      }
    };

    resolveAll();

    return () => {
      isSubscribed = false;
      Object.values(createdUrlsMap).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [customWallpapers, loaded]);

  const getWallpaperUrl = useCallback(
    (wp: WallpaperItem): string => {
      if (wp.isCustom) {
        return resolvedUrlsMap[wp.id] || '';
      }
      return wp.url;
    },
    [resolvedUrlsMap]
  );

  const setActiveWallpaperById = useCallback(async (id: string) => {
    setActiveWallpaperId(id);
    await storage.set('active_wallpaper_id', id);
  }, []);

  const uploadWallpaper = useCallback(
    async (file: File): Promise<void> => {
      const id = `custom-${Date.now()}`;
      const type: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';

      await wallpaperDB.save(id, file);

      const newItem: WallpaperItem = {
        id,
        name: file.name.split('.')[0] || 'Uploaded Media',
        type,
        url: '',
        isCustom: true,
      };

      setCustomWallpapers((prev) => {
        const updated = [...prev, newItem];
        storage.set('custom_wallpapers', updated);
        return updated;
      });
      await setActiveWallpaperById(id);
    },
    [setActiveWallpaperById]
  );

  const deleteWallpaper = useCallback(
    async (id: string) => {
      setCustomWallpapers((prev) => {
        const updated = prev.filter((w) => w.id !== id);
        storage.set('custom_wallpapers', updated);
        return updated;
      });

      await wallpaperDB.delete(id);

      if (activeWallpaperId === id) {
        await setActiveWallpaperById('nature');
      }
    },
    [activeWallpaperId, setActiveWallpaperById]
  );

  const setVideoPlaying = useCallback((playing: boolean) => {
    setIsVideoPlaying(playing);
  }, []);

  const setVideoMuted = useCallback(async (muted: boolean) => {
    setIsVideoMuted(muted);
    await storage.set('wallpaper_video_muted', muted);
  }, []);

  const setShouldLoopState = useCallback(async (loop: boolean) => {
    setShouldLoop(loop);
    await storage.set('wallpaper_video_loop', loop);
  }, []);

  const setShuffleEnabledState = useCallback(async (shuffle: boolean) => {
    setShuffleEnabled(shuffle);
    await storage.set('wallpaper_shuffle_enabled', shuffle);
  }, []);

  const triggerRandomWallpaper = useCallback(() => {
    const filterPresets = wallpapers.filter((w: WallpaperItem) => w.id !== activeWallpaperId);
    if (filterPresets.length === 0) return;
    const randomItem = filterPresets[Math.floor(Math.random() * filterPresets.length)];
    setActiveWallpaperId(randomItem.id);
  }, [wallpapers, activeWallpaperId]);

  const value = useMemo(
    () => ({
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
    }),
    [
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
      setShouldLoopState,
      setShuffleEnabledState,
      triggerRandomWallpaper,
      getWallpaperUrl,
    ]
  );

  if (!loaded) return null;

  return <WallpaperContext.Provider value={value}>{children}</WallpaperContext.Provider>;
};

export const useWallpaper = () => {
  const context = useContext(WallpaperContext);
  if (!context) {
    throw new Error('useWallpaper must be used within a WallpaperProvider');
  }
  return context;
};
