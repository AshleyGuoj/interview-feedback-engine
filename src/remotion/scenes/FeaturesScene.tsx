import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../styles';

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI 面试分析',
    desc: '自动提取面试问题，逐一深度分析表现',
  },
  {
    icon: '📊',
    title: '能力雷达图',
    desc: '多维度量化你的面试能力变化趋势',
  },
  {
    icon: '📈',
    title: '职业信号时间线',
    desc: 'AI 识别你的职业成长模式与转折点',
  },
];

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const exitOpacity = interpolate(frame, [220, 240], [1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.bg}, ${COLORS.bgGradient1})`,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
      }}
    >
      {/* Section title */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          opacity: titleOpacity,
          fontFamily: FONTS.display,
          fontSize: 40,
          fontWeight: 600,
          color: COLORS.textMuted,
          letterSpacing: '0.1em',
        }}
      >
        核心功能
      </div>

      {/* Feature cards */}
      <div style={{ display: 'flex', gap: 60, marginTop: 40 }}>
        {FEATURES.map((feat, i) => {
          const delay = i * 40;
          const opacity = interpolate(frame, [30 + delay, 55 + delay], [0, 1], { extrapolateRight: 'clamp' });
          const y = interpolate(frame, [30 + delay, 55 + delay], [80, 0], { extrapolateRight: 'clamp' });

          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                width: 420,
                padding: '48px 40px',
                borderRadius: 24,
                background: COLORS.surface,
                border: `1px solid ${COLORS.surfaceBorder}`,
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
              }}
            >
              <div style={{ fontSize: 64 }}>{feat.icon}</div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 32,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                {feat.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 22,
                  color: COLORS.textMuted,
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                {feat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
