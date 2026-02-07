import { useTranslation } from 'react-i18next';
import { MomentumStatus, MOMENTUM_CONFIG } from '@/types/career-signals';
import { Card, CardContent } from '@/components/ui/card';
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

  // Get localized momentum state label
  const getMomentumLabel = () => {
    switch (momentum.state) {
      case 'improving': return t('timeline.improving');
      case 'flat': return t('timeline.flat');
      case 'declining': return t('timeline.declining');
      default: return isEnglish ? config.label : config.labelZh;
    }
  };

  return (
    <Card className={cn(
      'border-2',
      momentum.state === 'improving' && 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20',
      momentum.state === 'declining' && 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
      momentum.state === 'flat' && 'border-muted',
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            momentum.state === 'improving' && 'bg-emerald-100 dark:bg-emerald-900/50',
            momentum.state === 'declining' && 'bg-red-100 dark:bg-red-900/50',
            momentum.state === 'flat' && 'bg-muted',
          )}>
            <Icon className={cn('w-6 h-6', config.color)} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('timeline.momentumTrend')}</span>
              <span className={cn('font-semibold', config.color)}>
                {getMomentumLabel()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {momentum.explanation}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
