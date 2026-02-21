import { AbsoluteFill, interpolate, useCurrentFrame, Img } from 'remotion';
import { COLORS, FONTS, FPS } from '../styles';
import logoSrc from '@/assets/offermind-logo-clean.png';

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const logoScale = interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: 'clamp' });

  const sloganOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' });
  const sloganY = interpolate(frame, [40, 70], [30, 0], { extrapolateRight: 'clamp' });

  const lineWidth = interpolate(frame, [80, 120], [0, 300], { extrapolateRight: 'clamp' });

  // Exit fade
  const exitOpacity = interpolate(frame, [130, 150], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.bgGradient2}, ${COLORS.bg})`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        {/* Logo */}
        <Img
          src={logoSrc}
          style={{
            width: 280,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        />

        {/* Divider line */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
          }}
        />

        {/* Slogan */}
        <div
          style={{
            opacity: sloganOpacity,
            transform: `translateY(${sloganY}px)`,
            fontFamily: FONTS.display,
            fontSize: 48,
            fontWeight: 600,
            color: COLORS.text,
            letterSpacing: '0.05em',
            textAlign: 'center',
          }}
        >
          每一场面试，都是你的
          <span style={{ color: COLORS.primaryGlow }}>职业资产</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
