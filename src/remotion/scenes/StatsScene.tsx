import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../styles';

const STATS = [
  { value: 10, suffix: '+', label: '面试维度分析' },
  { value: 3, suffix: '层', label: 'AI Agent 协同' },
  { value: 30, suffix: 's', label: '一键生成报告' },
];

export const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const exitOpacity = interpolate(frame, [190, 210], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      <div style={{ display: 'flex', gap: 120, alignItems: 'center' }}>
        {STATS.map((stat, i) => {
          const delay = i * 30;
          const opacity = interpolate(frame, [10 + delay, 35 + delay], [0, 1], { extrapolateRight: 'clamp' });
          const scale = interpolate(frame, [10 + delay, 35 + delay], [0.5, 1], { extrapolateRight: 'clamp' });

          // Counter animation
          const counterProgress = interpolate(frame, [35 + delay, 90 + delay], [0, 1], { extrapolateRight: 'clamp' });
          const displayValue = Math.round(stat.value * counterProgress);

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `scale(${scale})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 120,
                  fontWeight: 800,
                  color: COLORS.primaryGlow,
                  lineHeight: 1,
                }}
              >
                {displayValue}
                <span style={{ fontSize: 60, color: COLORS.accent }}>{stat.suffix}</span>
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 28,
                  color: COLORS.textMuted,
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
