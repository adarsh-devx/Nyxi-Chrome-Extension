import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: `rgba(15, 23, 42, var(--glass-opacity))`, // Dark slate-900 transparent fill
    backdropFilter: 'var(--bg-blur)',
    WebkitBackdropFilter: 'var(--bg-blur)',
    borderColor: `rgba(255, 255, 255, 0.08)`,
    transition: 'all var(--anim-duration) cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const hoverClass = hoverEffect ? 'glass-card-hover' : '';

  return (
    <div
      style={baseStyle}
      className={`rounded-2xl border p-6 shadow-xl ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
