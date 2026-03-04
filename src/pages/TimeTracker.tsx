import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  format, parseISO, isToday, isSameDay,
  addDays, subDays, addWeeks, subWeeks, addMonths, subMonths,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isWithinInterval,
} from 'date-fns';
import { zhCN, enUS, type Locale } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, FileText, Mic, ClipboardCheck, ExternalLink, Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDualTimezone } from '@/lib/timezone';
import { Job, InterviewStage } from '@/types/job';

type EventType = 'applied' | 'interview' | 'assessment';
type ViewMode = 'day' | 'week' | 'month';

interface TimelineEvent {
  id: string;
  type: EventType;
  date: Date;
  jobId: string;
  companyName: string;
  roleTitle: string;
  jobLink?: string;
  label: string;
  sublabel?: string;
  stageName?: string;
}

const ASSESSMENT_KEYWORDS = ['assessment', 'take-home', 'takehome', 'oa', '测评', '笔试', 'online assessment', 'coding challenge', 'test'];

function isAssessmentStage(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return ASSESSMENT_KEYWORDS.some(kw => lower.includes(kw));
}

function extractEvents(jobs: Job[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const job of jobs) {
    events.push({
      id: `applied-${job.id}`,
      type: 'applied',
      date: parseISO(job.createdAt),
      jobId: job.id,
      companyName: job.companyName,
      roleTitle: job.roleTitle,
      jobLink: job.jobLink,
      label: `${job.companyName} — ${job.roleTitle}`,
    });

    const allStages: { stage: InterviewStage; job: Job }[] = [];
    if (job.pipelines?.length) {
      for (const pipeline of job.pipelines) {
        for (const stage of pipeline.stages) {
          allStages.push({ stage, job });
        }
      }
    } else if (job.stages?.length) {
      for (const stage of job.stages) {
        allStages.push({ stage, job });
      }
    }

    for (const { stage, job: j } of allStages) {
      const timeStr = stage.scheduledTime || stage.date || stage.deadline;
      if (!timeStr) continue;
      let sublabel: string | undefined;
      if (stage.scheduledTime && stage.scheduledTimezone) {
        try { sublabel = formatDualTimezone(stage.scheduledTime, stage.scheduledTimezone); } catch { /* ignore */ }
      }
      const type: EventType = isAssessmentStage(stage.name) ? 'assessment' : 'interview';
      events.push({
        id: `stage-${j.id}-${stage.id}`,
        type,
        date: parseISO(timeStr),
        jobId: j.id,
        companyName: j.companyName,
        roleTitle: j.roleTitle,
        jobLink: j.jobLink,
        label: `${j.companyName} — ${stage.name}`,
        sublabel,
        stageName: stage.name,
      });
    }
  }
  return events;
}

const EVENT_ICONS: Record<EventType, typeof FileText> = {
  applied: FileText,
  interview: Mic,
  assessment: ClipboardCheck,
};

const EVENT_COLORS: Record<EventType, string> = {
  applied: 'text-blue-500',
  interview: 'text-amber-500',
  assessment: 'text-purple-500',
};

const CATEGORY_ORDER: EventType[] = ['applied', 'assessment', 'interview'];

function EventRow({ event, navigate }: { event: TimelineEvent; navigate: (path: string) => void }) {
  const { t } = useTranslation();
  const Icon = EVENT_ICONS[event.type];
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group"
      onClick={() => navigate(`/jobs/${event.jobId}`)}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', EVENT_COLORS[event.type])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{event.label}</span>
          {event.jobLink && (
            <a href={event.jobLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
            </a>
          )}
        </div>
        {event.sublabel && <p className="text-xs text-muted-foreground mt-0.5">{event.sublabel}</p>}
      </div>
      <Badge variant="secondary" className="text-[10px] shrink-0">
        {t(`timeTracker.type_${event.type}`)}
      </Badge>
    </div>
  );
}

function DaySection({
  dateKey, events, locale, lang, navigate, showDateHeader,
}: {
  dateKey: string; events: TimelineEvent[]; locale: Locale; lang: string; navigate: (p: string) => void; showDateHeader: boolean;
}) {
  const { t } = useTranslation();
  const date = parseISO(dateKey);
  const todayLabel = isToday(date) ? ` — ${t('timeTracker.today')}` : '';
  const dateLabel = format(date, lang === 'zh' ? 'M月d日，EEEE' : 'MMMM d, yyyy — EEEE', { locale }) + todayLabel;

  const byType = new Map<EventType, TimelineEvent[]>();
  for (const e of events) {
    if (!byType.has(e.type)) byType.set(e.type, []);
    byType.get(e.type)!.push(e);
  }

  return (
    <div>
      {showDateHeader && (
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{dateLabel}</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}
      <div className="space-y-4">
        {CATEGORY_ORDER.map(type => {
          const items = byType.get(type);
          if (!items?.length) return null;
          const Icon = EVENT_ICONS[type];
          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-1 px-2">
                <Icon className={cn('w-3.5 h-3.5', EVENT_COLORS[type])} />
                <span className="text-xs font-semibold text-muted-foreground">{t(`timeTracker.section_${type}`)}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{items.length}</Badge>
              </div>
              <div className="space-y-1">
                {items.map(ev => <EventRow key={ev.id} event={ev} navigate={navigate} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimeTracker() {
  const { t, i18n } = useTranslation();
  const { jobs } = useJobs();
  const navigate = useNavigate();
  const locale = i18n.language === 'zh' ? zhCN : enUS;
  const lang = i18n.language;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const allEvents = useMemo(() => extractEvents(jobs), [jobs]);

  // Compute date range based on view mode
  const { rangeStart, rangeEnd } = useMemo(() => {
    if (viewMode === 'day') {
      return { rangeStart: selectedDate, rangeEnd: selectedDate };
    } else if (viewMode === 'week') {
      return { rangeStart: startOfWeek(selectedDate, { weekStartsOn: 1 }), rangeEnd: endOfWeek(selectedDate, { weekStartsOn: 1 }) };
    } else {
      return { rangeStart: startOfMonth(selectedDate), rangeEnd: endOfMonth(selectedDate) };
    }
  }, [selectedDate, viewMode]);

  const filteredEvents = useMemo(() =>
    allEvents.filter(e => isWithinInterval(e.date, { start: rangeStart, end: rangeEnd })),
    [allEvents, rangeStart, rangeEnd]
  );

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of filteredEvents) {
      const key = format(e.date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [filteredEvents]);

  const sortedDates = useMemo(() => [...grouped.keys()].sort((a, b) => b.localeCompare(a)), [grouped]);

  // Summary counts
  const summary = useMemo(() => {
    const counts: Record<EventType, number> = { applied: 0, interview: 0, assessment: 0 };
    for (const e of filteredEvents) counts[e.type]++;
    return counts;
  }, [filteredEvents]);

  const navigate_ = (dir: -1 | 1) => {
    if (viewMode === 'day') setSelectedDate(d => dir === -1 ? subDays(d, 1) : addDays(d, 1));
    else if (viewMode === 'week') setSelectedDate(d => dir === -1 ? subWeeks(d, 1) : addWeeks(d, 1));
    else setSelectedDate(d => dir === -1 ? subMonths(d, 1) : addMonths(d, 1));
  };

  const dateDisplayLabel = useMemo(() => {
    if (viewMode === 'day') {
      const todaySuffix = isToday(selectedDate) ? ` (${t('timeTracker.today')})` : '';
      return format(selectedDate, lang === 'zh' ? 'M月d日，EEEE' : 'MMMM d, yyyy — EEEE', { locale }) + todaySuffix;
    } else if (viewMode === 'week') {
      const s = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const e = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(s, lang === 'zh' ? 'M月d日' : 'MMM d', { locale })} – ${format(e, lang === 'zh' ? 'M月d日' : 'MMM d', { locale })}`;
    } else {
      return format(selectedDate, lang === 'zh' ? 'yyyy年M月' : 'MMMM yyyy', { locale });
    }
  }, [selectedDate, viewMode, lang, locale, t]);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('timeTracker.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('timeTracker.subtitle')}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date navigator */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-1 py-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate_(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[140px] text-center whitespace-nowrap">
              {dateDisplayLabel}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate_(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Today button */}
          {!isToday(selectedDate) && (
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSelectedDate(new Date())}>
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              {t('timeTracker.today')}
            </Button>
          )}

          {/* View mode toggle */}
          <div className="flex gap-1 ml-auto">
            {(['day', 'week', 'month'] as ViewMode[]).map(m => (
              <Button key={m} variant={viewMode === m ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setViewMode(m)}>
                {t(`timeTracker.view_${m}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary strip */}
        {filteredEvents.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {summary.applied > 0 && <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-blue-500" />{summary.applied} {t('timeTracker.type_applied')}</span>}
            {summary.assessment > 0 && <span className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5 text-purple-500" />{summary.assessment} {t('timeTracker.type_assessment')}</span>}
            {summary.interview > 0 && <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5 text-amber-500" />{summary.interview} {t('timeTracker.type_interview')}</span>}
          </div>
        )}

        {/* Content */}
        {sortedDates.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('timeTracker.noEvents')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(dateStr => (
              <DaySection
                key={dateStr}
                dateKey={dateStr}
                events={grouped.get(dateStr)!}
                locale={locale}
                lang={lang}
                navigate={navigate}
                showDateHeader={viewMode !== 'day'}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
