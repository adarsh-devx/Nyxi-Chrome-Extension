import React, { memo, forwardRef } from 'react';
import { LiquidMetal as LiquidMetalShader } from '@paper-design/shaders-react';

export interface LiquidMetalProps {
  colorBack?: string;
  colorTint?: string;
  speed?: number;
  repetition?: number;
  distortion?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LiquidMetal: React.FC<LiquidMetalProps> = memo(({
  colorBack = '#aaaaac',
  colorTint = '#ffffff',
  speed = 0.5,
  repetition = 4,
  distortion = 0.1,
  scale = 1,
  className = '',
  style,
}) => {
  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 0,
        overflow: 'hidden',
        ...style
      }}
    >
      <LiquidMetalShader
        colorBack={colorBack}
        colorTint={colorTint}
        speed={speed}
        repetition={repetition}
        distortion={distortion}
        softness={0}
        shiftRed={0.3}
        shiftBlue={-0.3}
        angle={45}
        shape="none"
        scale={scale}
        fit="cover"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

LiquidMetal.displayName = 'LiquidMetal';

// ===========================================================================
// LiquidMetalButton - Reusable premium button with liquid metal border
// ===========================================================================

export interface LiquidMetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  borderWidth?: number;
  metalConfig?: Omit<LiquidMetalProps, 'className' | 'style'>;
  size?: 'sm' | 'md' | 'lg';
}

export const LiquidMetalButton = forwardRef<
  HTMLButtonElement,
  LiquidMetalButtonProps
>(
  (
    {
      children,
      icon,
      borderWidth = 3,
      metalConfig,
      size = 'md',
      className = '',
      style,
      disabled,
      ...props
    },
    ref
  ) => {
    // Pure CSS sizing mappings
    const paddingStyles = {
      sm: { paddingTop: '0.375rem', paddingBottom: '0.375rem', paddingLeft: '0.375rem', paddingRight: '1rem', gap: '0.5rem', fontSize: '0.8125rem' },
      md: { paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '0.5rem', paddingRight: '1.25rem', gap: '0.75rem', fontSize: '0.9375rem' },
      lg: { paddingTop: '0.625rem', paddingBottom: '0.625rem', paddingLeft: '0.625rem', paddingRight: '1.5rem', gap: '1rem', fontSize: '1.0625rem' },
    };

    const iconBoxSizes = {
      sm: { width: '1.75rem', height: '1.75rem' },
      md: { width: '2.125rem', height: '2.125rem' },
      lg: { width: '2.5rem', height: '2.5rem' },
    };

    // Button body base styling (blends with theme automatically)
    const buttonBodyStyle: React.CSSProperties = {
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      zIndex: 10,
      transition: 'background-color var(--anim-duration) ease, color var(--anim-duration) ease',
      ...paddingStyles[size],
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`relative cursor-pointer border-none bg-transparent p-0 outline-none active-scale-98 ${className}`}
        style={{
          display: 'inline-block',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          ...style
        }}
        {...props}
      >
        <div
          className="relative rounded-full overflow-hidden shadow-xl"
          style={{ padding: borderWidth, position: 'relative', display: 'flex', overflow: 'hidden', borderRadius: '9999px' }}
        >
          {/* Liquid Metal Shader Border Layer */}
          <LiquidMetal
            colorBack={metalConfig?.colorBack ?? '#888888'}
            colorTint={metalConfig?.colorTint ?? '#ffffff'}
            speed={metalConfig?.speed ?? 0.4}
            repetition={metalConfig?.repetition ?? 4}
            distortion={metalConfig?.distortion ?? 0.15}
            scale={metalConfig?.scale ?? 1}
            className="absolute inset-0 z-0 rounded-full"
          />

          {/* Inner Button Body Container */}
          <div style={buttonBodyStyle} className="hover-bg-slate-40">
            {icon && (
              <div
                style={{
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                  ...iconBoxSizes[size],
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </span>
              </div>
            )}
            <span className="font-semibold tracking-tight">
              {children}
            </span>
          </div>
        </div>
      </button>
    );
  }
);

LiquidMetalButton.displayName = 'LiquidMetalButton';

export default LiquidMetalButton;
