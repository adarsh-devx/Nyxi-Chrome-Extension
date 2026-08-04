export type SettingsTabKey = 'wallpaper' | 'filters' | 'data';

export interface ThemeSwatch {
  name: string;
  value: string;
}

export interface GalleryWallpaperItem {
  id: string;
  name: string;
  thumbnail: string;
  type: 'image' | 'video' | 'dynamic';
  url: string;
  isCustom?: boolean;
}
