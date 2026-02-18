import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TimelineItem, SIGNAL_TYPE_CONFIG } from '@/types/career-signals';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface SignalTimelineItemProps {
  item: TimelineItem;
  isFirst?: boolean;
  isLast?: boolean;
}

export function SignalTimelineItem({ item, isFirst, isLast }: SignalTimelineItemProps) {
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

  const shortSummary = item.signalSummary.length > 120
    ? item.signalSummary.slice(0, 120).trim() + '…'
    : item.signalSummary;
  const hasMore = item.signalSummary.length > 120 || item.whyItMatters.length > 0;

  // ── TURNING POINT: Full card treatment ──
  if (isTurningPoint) {
    return (
      <div className="relative pl-8">
        {/* Spine */}
        {!isLast && <div className="absolute left-[5px] top-5 w-px h-full bg-border/60" />}
        {/* Dot — larger for turning points */}
        <div className="absolute left-0 top-[10px] w-3 h-3 flex items-center justify-center z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/10" />
        </div>

        <div className="rounded-xl surface-insight border border-primary/[0.08] border-l-2 border-l-primary/25 p-5 transition-colors">
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
              {getSignalLabel()}
            </span>
            <span className="text-[11px] text-muted-foreground/60 tabular-nums">
              {format(new Date(item.date), 'yyyy/MM/dd')}
            </span>
          </div>

          <h3 className="text-[16px] font-semibold text-foreground mb-1">{item.title}</h3>

          {(item.context.company || item.context.role) && (
            <p className="text-[12px] text-muted-foreground/60 mb-2">
              {item.context.company}{item.context.role && ` · ${item.context.role}`}
            </p>
          )}

          <p className="text-[13px] font-medium text-foreground/85 leading-[1.6]">
            {expanded ? item.signalSummary : shortSummary}
          </p>

          {expanded && item.whyItMatters && (
            <p className="text-[12px] text-muted-foreground leading-[1.6] mt-2">{item.whyItMatters}</p>
          )}

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

  // ── STRONG SIGNAL: Light container ──
  if (isStrong) {
    return (
      <div className="relative pl-8">
        {!isLast && <div className="absolute left-[5px] top-5 w-px h-full bg-border/60" />}
        <div className="absolute left-0 top-[10px] w-3 h-3 flex items-center justify-center z-10">
          <div className="w-2 h-2 rounded-full bg-primary/50" />
        </div>

        <div className="rounded-lg border border-border/60 bg-card/50 px-4 py-3.5 transition-colors">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {getSignalLabel()}
            </span>
            <span className="text-[11px] text-muted-foreground/50 tabular-nums">
              {format(new Date(item.date), 'yyyy/MM/dd')}
            </span>
          </div>

          <h3 className="text-[15px] font-semibold text-foreground mb-0.5">{item.title}</h3>

          {(item.context.company || item.context.role) && (
            <p className="text-[12px] text-muted-foreground/50 mb-1.5">
              {item.context.company}{item.context.role && ` · ${item.context.role}`}
            </p>
          )}

          <p className="text-[13px] text-foreground/75 leading-[1.6]">
            {expanded ? item.signalSummary : shortSummary}
          </p>

          {expanded && item.whyItMatters && (
            <p className="text-[12px] text-muted-foreground leading-[1.6] mt-1.5">{item.whyItMatters}</p>
          )}

          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 text-[12px] text-primary/60 hover:text-primary font-medium flex items-center gap-1 transition-colors"
            >
              {expanded ? t('common.collapse', 'Collapse') : t('common.viewDetails', 'View details')}
              <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── MEDIUM / WEAK: Borderless text block on the spine ──
  return (
    <div className="relative pl-8">
      {!isLast && <div className="absolute left-[5px] top-5 w-px h-full bg-border/40" />}
      <div className="absolute left-0 top-[10px] w-3 h-3 flex items-center justify-center z-10">
        <div className={cn(
          'rounded-full',
          item.type === 'medium_signal' ? 'w-1.5 h-1.5 bg-foreground/25' : 'w-1.5 h-1.5 bg-foreground/12',
        )} />
      </div>

      <div className="py-2.5">
        <div className="flex items-center gap-3 mb-0.5">
          <h3 className="text-[14px] font-medium text-foreground/80">{item.title}</h3>
          <span className="text-[11px] text-muted-foreground/40 tabular-nums shrink-0">
            {format(new Date(item.date), 'yyyy/MM/dd')}
          </span>
        </div>

        {(item.context.company || item.context.role) && (
          <p className="text-[12px] text-muted-foreground/45 mb-1">
            {item.context.company}{item.context.role && ` · ${item.context.role}`}
          </p>
        )}

        <p className="text-[13px] text-foreground/60 leading-[1.55]">
          {expanded ? item.signalSummary : shortSummary}
        </p>

        {expanded && item.whyItMatters && (
          <p className="text-[12px] text-muted-foreground/60 leading-[1.55] mt-1">{item.whyItMatters}</p>
        )}

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-[12px] text-muted-foreground/50 hover:text-foreground font-medium flex items-center gap-1 transition-colors"
          >
            {expanded ? t('common.collapse', 'Collapse') : t('common.viewDetails', 'View details')}
            <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>
    </div>
  );
}
