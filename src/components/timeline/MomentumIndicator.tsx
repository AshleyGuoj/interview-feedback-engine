import { useTranslation } from 'react-i18next';
import { MomentumStatus, MOMENTUM_CONFIG } from '@/types/career-signals';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MomentumIndicatorProps {
  momentum: MomentumStatus;
}

const iconMap = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'minus': Minus,
};

export function MomentumIndicator({ momentum }: MomentumIndicatorProps) {
  const { t, i18n } = useTranslation();
  const config = MOMENTUM_CONFIG[momentum.state];
  const Icon = iconMap[config.icon as keyof typeof iconMap] || Minus;
  const isEnglish = i18n.language === 'en';

  const getMomentumLabel = () => {
    switch (momentum.state) {
      case 'improving': return t('timeline.improving');
      case 'flat': return t('timeline.flat');
      case 'declining': return t('timeline.declining');
      default: return isEnglish ? config.label : config.labelZh;
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 h-full" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg surface-insight flex items-center justify-center shrink-0">
          <Icon className={cn('w-3.5 h-3.5', config.color)} />
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
          {t('timeline.momentumTrend')}
        </span>
      </div>

      {/* Trajectory label — large, signal-like */}
      <div className="mb-3">
        <span className={cn('text-[20px] font-semibold tracking-[-0.01em]', config.color)}>
          {getMomentumLabel()}
        </span>
      </div>

      <p className="text-[13px] text-muted-foreground leading-[1.6]">
        {momentum.explanation}
      </p>
    </div>
  );
}
