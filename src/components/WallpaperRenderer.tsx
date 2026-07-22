import React, { useEffect, useRef } from 'react';
import { useWallpaper } from '../context/WallpaperContext';
import { useSettings } from '../context/SettingsContext';

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
}

export const WallpaperRenderer: React.FC = () => {
  const { activeWallpaper, isVideoPlaying, isVideoMuted, shouldLoop, getWallpaperUrl } = useWallpaper();
  const { settings } = useSettings();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const videoSrc = getWallpaperUrl(activeWallpaper);

  // Synchronize HTML5 Video properties
  useEffect(() => {
    const video = videoRef.current;
    if (!video || activeWallpaper.type !== 'video' || !videoSrc) return;

    video.muted = isVideoMuted;
    video.loop = shouldLoop;

    if (isVideoPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [activeWallpaper.id, activeWallpaper.type, videoSrc, isVideoPlaying, isVideoMuted, shouldLoop]);

  // Dynamic Stars Particle Animation Loop
  useEffect(() => {
    if (activeWallpaper.id !== 'dynamic-particles') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: ParticleNode[] = [];
    const maxParticles = 120;
    const mouse = { x: -1000, y: -1000 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initialize stars
    for (let i = 0; i < maxParticles; i++) {
      const radius = Math.random() * 1.5 + 0.5;
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius,
        baseAlpha: Math.random() * 0.5 + 0.3,
        alpha: 0,
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const accent = settings.accentColor;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Proximity glow to mouse cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          p.alpha = p.baseAlpha + (1 - dist / 180) * 0.5;
        } else {
          p.alpha = p.baseAlpha;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      animationId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [activeWallpaper.id, settings.accentColor]);

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

      {/* 3. Canvas Dynamic Stars Wallpaper */}
      {activeWallpaper.type === 'dynamic' && (
        <div className="w-full h-full relative" style={backgroundFilterStyle}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      )}
    </div>
  );
};
