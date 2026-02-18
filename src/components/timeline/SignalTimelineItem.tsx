import { useTranslation } from 'react-i18next';
import { TimelineItem, SIGNAL_TYPE_CONFIG } from '@/types/career-signals';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SignalTimelineItemProps {
  item: TimelineItem;
  isFirst?: boolean;
}

export function SignalTimelineItem({ item, isFirst }: SignalTimelineItemProps) {
  const { t, i18n } = useTranslation();
  const config = SIGNAL_TYPE_CONFIG[item.type];
  const isTurningPoint = item.type === 'turning_point';
  const isEnglish = i18n.language === 'en';

  const getSignalLabel = () => {
    switch (item.type) {
      case 'turning_point': return t('timeline.turningPoint');
      case 'strong_signal': return t('timeline.strongSignal');
      case 'medium_signal': return t('timeline.mediumSignal');
      case 'weak_signal': return t('timeline.weakSignal');
      default: return isEnglish ? config.label : config.labelZh;
    }
  };

  const getConfidenceLabel = () => {
    switch (item.confidence) {
      case 'high': return t('timeline.highConfidence');
      case 'medium': return t('timeline.mediumConfidence');
      case 'low': return t('timeline.lowConfidence');
      default: return '';
    }
  };

  // Dot color based on signal type — muted palette
  const dotColor = cn(
    'w-2 h-2 rounded-full shrink-0',
    isTurningPoint && 'bg-foreground',
    item.type === 'strong_signal' && 'bg-foreground/70',
    item.type === 'medium_signal' && 'bg-foreground/40',
    item.type === 'weak_signal' && 'bg-foreground/20',
  );

  return (
    <div className="relative pl-8">
      {/* Timeline spine — monochrome */}
      <div className="absolute left-[5px] top-5 w-px h-full bg-border" />
      
      {/* Signal dot — minimal */}
      <div className="absolute left-0 top-[10px] w-3 h-3 flex items-center justify-center z-10">
        <div className={dotColor} />
      </div>

      <div className={cn(
        'rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30',
        isTurningPoint && 'border-foreground/15',
      )}>
        {/* Header */}
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {getSignalLabel()}
            </span>
            {item.confidence === 'high' && (
              <span className="text-[10px] text-muted-foreground/60">
                · {getConfidenceLabel()}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {format(new Date(item.date), 'yyyy/MM/dd')}
          </span>
        </div>

        <h3 className="text-[14px] font-semibold text-foreground mb-1">
          {item.title}
        </h3>

        {/* Context */}
        {(item.context.company || item.context.role) && (
          <p className="text-[12px] text-muted-foreground mb-2.5">
            {item.context.company}
            {item.context.role && ` · ${item.context.role}`}
          </p>
        )}

        {/* Signal content */}
        <div className="space-y-1.5">
          <p className="text-[13px] text-foreground/90 leading-relaxed">{item.signalSummary}</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            {item.whyItMatters}
          </p>
        </div>
      </div>
    </div>
  );
}
