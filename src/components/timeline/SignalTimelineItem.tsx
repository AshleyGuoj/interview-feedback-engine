import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TimelineItem, SIGNAL_TYPE_CONFIG } from '@/types/career-signals';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface SignalTimelineItemProps {
  item: TimelineItem;
  isFirst?: boolean;
}

export function SignalTimelineItem({ item, isFirst }: SignalTimelineItemProps) {
  const { t, i18n } = useTranslation();
  const isTurningPoint = item.type === 'turning_point';
  const isStrong = item.type === 'strong_signal';
  const [expanded, setExpanded] = useState(false);
  const isEnglish = i18n.language === 'en';

  const getSignalLabel = () => {
    switch (item.type) {
      case 'turning_point': return t('timeline.turningPoint');
      case 'strong_signal': return t('timeline.strongSignal');
      case 'medium_signal': return t('timeline.mediumSignal');
      case 'weak_signal': return t('timeline.weakSignal');
      default: {
        const config = SIGNAL_TYPE_CONFIG[item.type as keyof typeof SIGNAL_TYPE_CONFIG];
        if (!config) return item.type;
        return isEnglish ? config.label : config.labelZh;
      }
    }
  };

  // Truncate summary for collapsed state
  const shortSummary = item.signalSummary.length > 120
    ? item.signalSummary.slice(0, 120).trim() + '…'
    : item.signalSummary;
  const hasMore = item.signalSummary.length > 120 || item.whyItMatters.length > 0;

  return (
    <div className="relative pl-8">
      {/* Timeline spine */}
      <div className="absolute left-[5px] top-5 w-px h-full bg-border" />

      {/* Signal dot */}
      <div className="absolute left-0 top-[10px] w-3 h-3 flex items-center justify-center z-10">
        <div className={cn(
          'rounded-full shrink-0',
          isTurningPoint && 'w-2.5 h-2.5 bg-[hsl(var(--accent-warm))]',
          isStrong && 'w-2 h-2 bg-[hsl(var(--accent-cool))]',
          item.type === 'medium_signal' && 'w-2 h-2 bg-foreground/30',
          item.type === 'weak_signal' && 'w-1.5 h-1.5 bg-foreground/15',
        )} />
      </div>

      <div className={cn(
        'rounded-xl p-4 transition-colors',
        isTurningPoint
          ? 'surface-insight border border-[hsl(var(--accent-warm))]/[0.1] border-l-2 border-l-[hsl(var(--accent-warm))]/30'
          : isStrong
            ? 'bg-muted/30'
            : '',
      )}>
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className={cn(
            'text-[11px] font-semibold uppercase tracking-[0.08em]',
            isTurningPoint ? 'text-[hsl(var(--accent-warm))]' : isStrong ? 'text-[hsl(var(--accent-cool))]' : 'text-muted-foreground'
          )}>
            {getSignalLabel()}
          </span>
          <span className="text-[11px] text-muted-foreground/60 tabular-nums">
            {format(new Date(item.date), 'yyyy/MM/dd')}
          </span>
        </div>

        {/* Title — emphasis varies by level */}
        <h3 className={cn(
          'font-semibold text-foreground mb-1',
          isTurningPoint ? 'text-[16px]' : isStrong ? 'text-[15px]' : 'text-[14px]',
        )}>
          {item.title}
        </h3>

        {/* Context */}
        {(item.context.company || item.context.role) && (
          <p className="text-[12px] text-muted-foreground/80 mb-2">
            {item.context.company}
            {item.context.role && ` · ${item.context.role}`}
          </p>
        )}

        {/* Signal summary — collapsed by default */}
        <p className={cn(
          'text-[13px] leading-[1.6]',
          isTurningPoint ? 'text-foreground/85 font-medium' : 'text-foreground/75',
        )}>
          {expanded ? item.signalSummary : shortSummary}
        </p>

        {/* Expanded: why it matters */}
        {expanded && item.whyItMatters && (
          <p className="text-[12px] text-muted-foreground leading-[1.6] mt-2">
            {item.whyItMatters}
          </p>
        )}

        {/* Expand/collapse */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-[12px] text-primary/70 hover:text-primary font-medium flex items-center gap-1 transition-colors"
          >
            {expanded ? t('common.collapse', 'Collapse') : t('common.viewDetails', 'View details')}
            <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>
    </div>
  );
}
