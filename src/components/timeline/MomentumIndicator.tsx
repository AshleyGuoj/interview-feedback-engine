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
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className={cn('w-4 h-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
              {t('timeline.momentumTrend')}
            </span>
            <span className={cn('text-[13px] font-semibold', config.color)}>
              {getMomentumLabel()}
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
            {momentum.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
