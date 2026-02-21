import { AbsoluteFill, interpolate, useCurrentFrame, Img } from 'remotion';
import { COLORS, FONTS } from '../styles';
import logoSrc from '@/assets/offermind-logo-clean.png';

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 20], [0.9, 1], { extrapolateRight: 'clamp' });

  // Pulsing glow
  const glowIntensity = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.3, 0.8],
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.bgGradient2}, ${COLORS.bg})`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 48,
          transform: `scale(${scale})`,
        }}
      >
        <Img src={logoSrc} style={{ width: 200 }} />

        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 800,
            color: COLORS.text,
            textAlign: 'center',
          }}
        >
          立即体验{' '}
          <span style={{ color: COLORS.primaryGlow }}>OfferMind</span>
        </div>

        {/* CTA button mockup */}
        <div
          style={{
            padding: '20px 64px',
            borderRadius: 16,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryGlow})`,
            fontFamily: FONTS.display,
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
            boxShadow: `0 0 ${40 * glowIntensity}px ${COLORS.primary}`,
          }}
        >
          开始使用 →
        </div>

        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            color: COLORS.textDim,
          }}
        >
          interview-feedback-engine.lovable.app
        </div>
      </div>
    </AbsoluteFill>
  );
};
