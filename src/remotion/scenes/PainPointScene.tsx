import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS, FPS } from '../styles';

const PAIN_POINTS = [
  '面试完就忘了？',
  '不知道哪里答得不好？',
  '每次都犯同样的错？',
];

export const PainPointScene: React.FC = () => {
  const frame = useCurrentFrame();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Exit
  const exitOpacity = interpolate(frame, [190, 210], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: bgOpacity * exitOpacity,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60 }}>
        {PAIN_POINTS.map((text, i) => {
          const delay = i * 50;
          const opacity = interpolate(frame, [20 + delay, 45 + delay], [0, 1], { extrapolateRight: 'clamp' });
          const x = interpolate(frame, [20 + delay, 45 + delay], [i % 2 === 0 ? -80 : 80, 0], { extrapolateRight: 'clamp' });
          const scale = interpolate(frame, [45 + delay, 55 + delay], [1, 1.05], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateX(${x}px) scale(${scale})`,
                fontFamily: FONTS.display,
                fontSize: 56,
                fontWeight: 700,
                color: COLORS.text,
                textAlign: 'center',
                textShadow: `0 0 40px ${COLORS.primary}33`,
              }}
            >
              {text}
            </div>
          );
        })}

        {/* Subtle answer hint */}
        <div
          style={{
            opacity: interpolate(frame, [160, 180], [0, 1], { extrapolateRight: 'clamp' }),
            fontFamily: FONTS.body,
            fontSize: 28,
            color: COLORS.primaryGlow,
            fontWeight: 500,
          }}
        >
          OfferMind 帮你解决 →
        </div>
      </div>
    </AbsoluteFill>
  );
};
