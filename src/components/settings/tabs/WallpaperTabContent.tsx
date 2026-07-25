import React, { useRef, useState } from 'react';
import {
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Shuffle,
  Dices,
  Image as ImageIcon,
  Palette,
  Check,
  Star,
  Trash2,
} from 'lucide-react';
import { useWallpaper } from '../../../context/WallpaperContext';
import { useSettings } from '../../../context/SettingsContext';

const themeSwatches = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
];

export const WallpaperTabContent: React.FC = () => {
  const {
    wallpapers,
    activeWallpaper,
    isVideoMuted,
    isVideoPlaying,
    shouldLoop,
    isShuffleEnabled,
    setActiveWallpaperById,
    uploadWallpaper,
    deleteWallpaper,
    setVideoPlaying,
    setVideoMuted,
    setShouldLoop,
    setShuffleEnabled,
    triggerRandomWallpaper,
    getWallpaperUrl,
  } = useWallpaper();

  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({ nature: true });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadWallpaper(file);
    } catch {
      alert('Failed to upload file. Please try a smaller file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getBlurLabel = (px: number) => {
    if (px <= 4) return 'Low';
    if (px <= 10) return 'Medium';
    if (px <= 16) return 'High';
    return 'Ultra';
  };

  return (
    <div className="nyxi-wallpaper-grid-master">
      {/* LEFT COLUMN: Upload Wallpaper (Top) + Wallpaper Gallery (Bottom) */}
      <div className="nyxi-wallpaper-left-col">
        {/* 1. UPLOAD WALLPAPER */}
        <div className="nyxi-card-section">
          <div>
            <h4 className="nyxi-card-title">
              <Upload className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
              UPLOAD WALLPAPER
            </h4>
            <p className="nyxi-card-subtitle">Upload your own image, GIF or video.</p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="nyxi-upload-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[var(--accent-color,#8b5cf6)]/15 border border-[var(--accent-color,#8b5cf6)]/30 flex items-center justify-center text-[var(--accent-color,#8b5cf6)] shadow-lg shadow-[var(--accent-color,#8b5cf6)]/20">
              <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-white/80 font-medium text-xs">
                {isUploading ? 'Uploading file...' : 'Drag & drop your file here'}
              </span>
              <span className="text-white/40 text-[11px]">or</span>
            </div>

            <button type="button" className="nyxi-browse-btn">
              Browse Files
            </button>

            <span className="text-white/35 text-[10px] tracking-wide mt-1">
              PNG, JPG, GIF, WEBP, MP4, WEBM (Max 500MB)
            </span>
          </div>
        </div>

        {/* 2. WALLPAPER GALLERY */}
        <div className="nyxi-card-section">
          <div className="nyxi-card-header">
            <h4 className="nyxi-card-title">
              <ImageIcon className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
              WALLPAPER GALLERY
            </h4>
            <button
              type="button"
              onClick={triggerRandomWallpaper}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
              Randomize
            </button>
          </div>

          <div className="nyxi-gallery-grid">
            {wallpapers.map((item) => {
              const isActive = activeWallpaper.id === item.id;
              const isFav = !!favorites[item.id];
              const mediaUrl = getWallpaperUrl(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveWallpaperById(item.id)}
                  aria-label={`Select ${item.name} wallpaper`}
                  aria-pressed={isActive}
                  className={`nyxi-gallery-card text-left ${isActive ? 'active' : ''}`}
                >
                  {/* Active Checkmark Badge */}
                  {isActive && (
                    <div className="nyxi-badge-check">
                      <Check className="w-3 h-3" />
                    </div>
                  )}

                  {/* Star Favorite */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => toggleFavorite(item.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        toggleFavorite(item.id, e as any);
                      }
                    }}
                    className={`nyxi-star-favorite ${isFav ? 'active' : ''}`}
                    title="Favorite wallpaper"
                    aria-label={`Favorite ${item.name}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </span>

                  {/* Delete button for custom wallpapers */}
                  {item.isCustom && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWallpaper(item.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          deleteWallpaper(item.id);
                        }
                      }}
                      className="absolute bottom-2 right-2 z-10 p-1 rounded-md bg-red-950/70 text-red-300 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      title="Delete wallpaper"
                      aria-label={`Delete custom wallpaper ${item.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}

                  {/* Media Content */}
                  {item.type === 'video' ? (
                    <div className="relative w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                      {mediaUrl ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-950 flex items-center justify-center text-white/30 text-[10px] font-mono">
                          LOADING...
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white/80">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={item.name}
                      className="nyxi-gallery-img"
                      loading="eager"
                      decoding="async"
                    />
                  )}

                  {/* Caption */}
                  <div className="nyxi-card-caption">{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Playback Controls (Top) + Appearance (Bottom) */}
      <div className="nyxi-wallpaper-right-col">
        {/* 3. PLAYBACK CONTROLS */}
        <div className="nyxi-card-section">
          <h4 className="nyxi-card-title">
            <Play className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
            PLAYBACK CONTROLS
          </h4>

          <div className="nyxi-playback-grid">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={() => setVideoPlaying(!isVideoPlaying)}
              className={`nyxi-playback-tile ${isVideoPlaying ? 'active' : ''}`}
            >
              <div className="nyxi-tile-icon-circle">
                {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </div>
              <span className="text-[11px] font-semibold">Play / Pause</span>
            </button>

            {/* Mute */}
            <button
              type="button"
              onClick={() => setVideoMuted(!isVideoMuted)}
              className={`nyxi-playback-tile ${isVideoMuted ? 'active' : ''}`}
            >
              <div className="nyxi-tile-icon-circle">
                {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <span className="text-[11px] font-semibold">{isVideoMuted ? 'Muted' : 'Sound'}</span>
            </button>

            {/* Loop */}
            <button
              type="button"
              onClick={() => setShouldLoop(!shouldLoop)}
              className={`nyxi-playback-tile ${shouldLoop ? 'active' : ''}`}
            >
              <div className="nyxi-tile-icon-circle">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold">Loop</span>
            </button>

            {/* Shuffle */}
            <button
              type="button"
              onClick={() => setShuffleEnabled(!isShuffleEnabled)}
              className={`nyxi-playback-tile ${isShuffleEnabled ? 'active' : ''}`}
            >
              <div className="nyxi-tile-icon-circle">
                <Shuffle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold">Shuffle</span>
            </button>
          </div>
        </div>

        {/* 4. APPEARANCE */}
        <div className="nyxi-card-section">
          <h4 className="nyxi-card-title">
            <Palette className="w-4 h-4 text-[var(--accent-color,#8b5cf6)]" />
            APPEARANCE
          </h4>

          {/* Theme Tint Swatches */}
          <div className="flex flex-col gap-2">
            <span className="text-white/70 text-xs font-semibold">Theme Tint</span>
            <div className="nyxi-swatches-row">
              {themeSwatches.map((color) => {
                const isSelected = settings.accentColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => updateSettings({ accentColor: color.value })}
                    className={`nyxi-swatch-circle ${isSelected ? 'selected' : ''}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                );
              })}
            </div>
          </div>

          {/* Panel Transparency Slider */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70 font-semibold">Panel Transparency</span>
              <span className="text-white/50 font-semibold">
                {Math.round((1 - settings.glassOpacity) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={settings.glassOpacity}
              onChange={(e) => updateSettings({ glassOpacity: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Blur Intensity Slider */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70 font-semibold">Blur Intensity</span>
              <span className="text-white/50 font-semibold">{getBlurLabel(settings.blur)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={settings.blur}
              onChange={(e) => updateSettings({ blur: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
