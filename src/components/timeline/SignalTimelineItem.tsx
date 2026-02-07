import { useTranslation } from 'react-i18next';
import { TimelineItem, SIGNAL_TYPE_CONFIG } from '@/types/career-signals';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Activity, Minus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SignalTimelineItemProps {
  item: TimelineItem;
  isFirst?: boolean;
}

const iconMap = {
  star: Star,
  zap: Zap,
  activity: Activity,
  minus: Minus,
};

export function SignalTimelineItem({ item, isFirst }: SignalTimelineItemProps) {
  const { t, i18n } = useTranslation();
  const config = SIGNAL_TYPE_CONFIG[item.type];
  const Icon = iconMap[config.icon as keyof typeof iconMap] || Activity;
  const isTurningPoint = item.type === 'turning_point';
  const isEnglish = i18n.language === 'en';

  // Get localized signal type label
  const getSignalLabel = () => {
    switch (item.type) {
      case 'turning_point': return t('timeline.turningPoint');
      case 'strong_signal': return t('timeline.strongSignal');
      case 'medium_signal': return t('timeline.mediumSignal');
      case 'weak_signal': return t('timeline.weakSignal');
      default: return isEnglish ? config.label : config.labelZh;
    }
  };

  // Get localized confidence label
  const getConfidenceLabel = () => {
    switch (item.confidence) {
      case 'high': return t('timeline.highConfidence');
      case 'medium': return t('timeline.mediumConfidence');
      case 'low': return t('timeline.lowConfidence');
      default: return '';
    }
  };

  return (
    <div className="relative pl-10">
      {/* Timeline connector */}
      <div className={cn(
        'absolute left-3 top-6 w-0.5 h-full',
        isFirst ? 'bg-gradient-to-b from-primary/50 to-border' : 'bg-border'
      )} />
      
      {/* Signal dot */}
      <div className={cn(
        'absolute left-0 top-3 w-7 h-7 rounded-full flex items-center justify-center',
        'border-2 bg-background z-10',
        isTurningPoint && 'border-amber-500 ring-2 ring-amber-200 dark:ring-amber-900/50',
        item.type === 'strong_signal' && 'border-primary',
        item.type === 'medium_signal' && 'border-blue-500',
        item.type === 'weak_signal' && 'border-muted-foreground/50',
      )}>
        <Icon className={cn('w-3.5 h-3.5', config.color)} />
      </div>

      <Card className={cn(
        'transition-all hover:shadow-md',
        isTurningPoint && 'ring-1 ring-amber-300 dark:ring-amber-700',
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn('text-xs', config.bgColor, config.color)}>
                  {getSignalLabel()}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(item.date), 'yyyy/MM/dd')}
                </span>
                {item.confidence === 'high' && (
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                    {getConfidenceLabel()}
                  </Badge>
                )}
              </div>
              <h3 className={cn(
                'font-semibold',
                isTurningPoint && 'text-amber-700 dark:text-amber-400'
              )}>
                {item.title}
              </h3>
            </div>
          </div>

          {/* Context */}
          {(item.context.company || item.context.role) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {item.context.company}
                {item.context.role && ` · ${item.context.role}`}
              </span>
            </div>
          )}

          {/* Signal Summary */}
          <div className="space-y-2 text-sm">
            <p className="text-foreground">{item.signalSummary}</p>
            <p className="text-muted-foreground italic">
              💡 {item.whyItMatters}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
