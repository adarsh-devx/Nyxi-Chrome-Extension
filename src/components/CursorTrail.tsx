import React, { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export const CursorTrail: React.FC = () => {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const isHoveringClickableRef = useRef(false);

  useEffect(() => {
    if (settings.cursorEffect === 'none') {
      document.body.style.cursor = 'default';
      return;
    }

    // Hide default cursor
    document.body.style.cursor = 'none';

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;

      // Spawn trail particles if enabled
      if (settings.cursorEffect === 'trail') {
        const accent = settings.accentColor;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 4 + 2,
          color: accent,
          speedX: (Math.random() - 0.5) * 1.5,
          speedY: (Math.random() - 0.5) * 1.5,
          opacity: 1,
        });
      }
    };

    // Track clicks for ripples
    const handleMouseDown = (e: MouseEvent) => {
      if (settings.cursorEffect === 'ripple' || settings.cursorEffect === 'trail' || settings.cursorEffect === 'magnetic') {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2,
          maxRadius: 40,
          opacity: 1,
          speed: 2.5,
        });
      }
    };

    // Track hovering over clickable items for magnetic hover effects
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.getAttribute('role') === 'button';

      isHoveringClickableRef.current = !!isClickable;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseover', handleMouseOver);

    // Dynamic animation loop (60 FPS)
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const effect = settings.cursorEffect;
      const accent = settings.accentColor;

      // 1. Ease custom cursor coordinates (Spring physics interpolation)
      const ease = 0.18; // Easing factor
      mouse.x += (mouse.targetX - mouse.x) * ease;
      mouse.y += (mouse.targetY - mouse.y) * ease;

      // 2. Render particles (trail effect)
      if (effect === 'trail') {
        particlesRef.current.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.opacity -= 0.025;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fill();
        });
        particlesRef.current = particlesRef.current.filter((p) => p.opacity > 0);
      }

      // 3. Render ripples (clicks)
      ripplesRef.current.forEach((r) => {
        r.radius += r.speed;
        r.opacity -= 0.03;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = Math.max(0, r.opacity);
        ctx.stroke();
      });
      ripplesRef.current = ripplesRef.current.filter((r) => r.opacity > 0);

      // 4. Render main cursor ring
      if (mouse.x > -50 && mouse.y > -50) {
        ctx.globalAlpha = 1;
        ctx.beginPath();

        const baseRadius = 8;
        const targetRadius = isHoveringClickableRef.current ? baseRadius * 2.5 : baseRadius;
        
        ctx.arc(mouse.x, mouse.y, targetRadius, 0, Math.PI * 2);

        if (effect === 'magnetic' && isHoveringClickableRef.current) {
          // Snapping/glow fill
          ctx.fillStyle = `${accent}15`; // transparent accent
          ctx.fill();
          ctx.strokeStyle = accent;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Simple cursor dot & ring outline
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Small center dot
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = accent;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationId);
      document.body.style.cursor = 'default';
    };
  }, [settings.cursorEffect, settings.accentColor]);

  if (settings.cursorEffect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] w-full h-full"
    />
  );
};
