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

  // Synchronize HTML5 Video properties
  useEffect(() => {
    const video = videoRef.current;
    const videoSrc = getWallpaperUrl(activeWallpaper);
    if (!video || activeWallpaper.type !== 'video' || !videoSrc) return;

    video.muted = isVideoMuted;
    video.loop = shouldLoop;

    if (isVideoPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [activeWallpaper.id, getWallpaperUrl(activeWallpaper), isVideoPlaying, isVideoMuted, shouldLoop]);

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
    const mouse = { x: -1000, y: -1000, radius: 180 };

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

      // Color base on accent color
      const accent = settings.accentColor;

      particles.forEach((p) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Gravity attraction fields (mouse push)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let forceX = 0;
        let forceY = 0;

        if (dist < mouse.radius) {
          // Push away force
          const force = (mouse.radius - dist) / mouse.radius;
          forceX = (dx / dist) * force * 1.2;
          forceY = (dy / dist) * force * 1.2;
        }

        // Apply visual drift back to natural movement
        p.x += forceX;
        p.y += forceY;

        // Animate twinkle/alpha
        p.alpha += (p.baseAlpha - p.alpha) * 0.05;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw faint connections between close particles to make a beautiful neural network style constellation
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [activeWallpaper, settings.accentColor]);

  // Styling properties
  const backgroundStyle: React.CSSProperties = {
    filter: `brightness(var(--bg-brightness))`,
    transition: 'filter 0.5s ease, opacity 0.5s ease',
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-55 overflow-hidden select-none pointer-events-none bg-slate-950">
      {/* 1. Static/Uploaded Image Background */}
      {activeWallpaper.type === 'image' && (
        <img
          src={getWallpaperUrl(activeWallpaper)}
          alt=""
          style={backgroundStyle}
          className="w-full h-full object-cover select-none"
        />
      )}

      {/* 2. Uploaded Video Background */}
      {activeWallpaper.type === 'video' && (
        <video
          ref={videoRef}
          src={getWallpaperUrl(activeWallpaper)}
          style={backgroundStyle}
          className="w-full h-full object-cover select-none"
          playsInline
        />
      )}

      {/* 3. Interactive Particle Canvas Background */}
      {activeWallpaper.type === 'dynamic' && (
        <canvas
          ref={canvasRef}
          style={backgroundStyle}
          className="w-full h-full object-cover select-none"
        />
      )}

      {/* Vignette Overlay for Premium Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.45))] pointer-events-none" />
    </div>
  );
};
