import React, { useEffect, useRef } from 'react';
import { useWallpaper } from '../context/WallpaperContext';
import { useSettings } from '../context/SettingsContext';

export const WallpaperRenderer: React.FC = () => {
  const { activeWallpaper, isVideoPlaying, isVideoMuted, shouldLoop, getWallpaperUrl } = useWallpaper();
  const { settings } = useSettings();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoSrc = getWallpaperUrl(activeWallpaper);

  // Synchronize HTML5 Video properties & auto-pause when tab is hidden (0% background CPU)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeWallpaper.type !== 'video' || !videoSrc) return;

    video.muted = isVideoMuted;
    video.loop = shouldLoop;

    const syncPlayback = () => {
      if (document.hidden) {
        video.pause();
      } else if (isVideoPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    syncPlayback();

    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [activeWallpaper.id, activeWallpaper.type, videoSrc, isVideoPlaying, isVideoMuted, shouldLoop]);

  // CSS Filter Styles
  const backgroundFilterStyle: React.CSSProperties = {
    filter: `blur(${settings.blur}px) brightness(${settings.brightness}%)`,
    transition: 'filter 0.5s ease',
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none select-none">
      {/* 1. Static/Preset Image Wallpaper */}
      {activeWallpaper.type === 'image' && (
        <img
          src={videoSrc}
          alt={activeWallpaper.name}
          className="w-full h-full object-cover animate-fade-in"
          style={backgroundFilterStyle}
          decoding="async"
        />
      )}

      {/* 2. Video Loop Wallpaper */}
      {activeWallpaper.type === 'video' && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover animate-fade-in"
          style={backgroundFilterStyle}
          playsInline
          muted={isVideoMuted}
          loop={shouldLoop}
          autoPlay
        />
      )}
    </div>
  );
};
