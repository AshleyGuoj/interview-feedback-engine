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
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg surface-insight flex items-center justify-center shrink-0 mt-0.5">
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wide">
              {t('timeline.momentumTrend')}
            </span>
            <span className={cn('text-[13px] font-semibold', config.color)}>
              {getMomentumLabel()}
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            {momentum.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
