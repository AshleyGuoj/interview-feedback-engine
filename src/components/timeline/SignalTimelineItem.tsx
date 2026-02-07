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
  const config = SIGNAL_TYPE_CONFIG[item.type];
  const Icon = iconMap[config.icon as keyof typeof iconMap] || Activity;
  const isTurningPoint = item.type === 'turning_point';

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
                  {config.labelZh}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(item.date), 'yyyy/MM/dd')}
                </span>
                {item.confidence === 'high' && (
                  <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                    高置信度
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
