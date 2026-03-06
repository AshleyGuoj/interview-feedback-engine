import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  format, parseISO, isToday, isSameDay,
  addDays, subDays, addWeeks, subWeeks, addMonths, subMonths,
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  isWithinInterval,
} from 'date-fns';
import { zhCN, enUS, type Locale } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, FileText, Mic, ClipboardCheck, PenLine, ExternalLink, Clock, CalendarDays, CalendarPlus, Gift, Circle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDualTimezone } from '@/lib/timezone';
import { Job, InterviewStage, detectStageCategory } from '@/types/job';
import { CheckCircle2 } from 'lucide-react';

type EventType = 'applied' | 'interview' | 'assessment' | 'written_test' | 'offer' | 'other';
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
  isCompleted?: boolean;
  isSchedulingAction?: boolean;
  isDeadline?: boolean;
}

function getEventTypeFromStage(stage: InterviewStage): EventType {
  const cat = stage.category || detectStageCategory(stage.name);
  if (cat === 'application' || cat === 'resume_screen' || cat === 'hr_screen') return 'applied';
  if (cat === 'written_test') return 'written_test';
  if (cat === 'assessment') return 'assessment';
  if (cat === 'hr_final' || cat === 'offer_call' || cat === 'offer_received') return 'offer';
  if (cat === 'interview') return 'interview';
  return 'other';
}

function extractEvents(jobs: Job[]): TimelineEvent[] {
  const lang = typeof navigator !== 'undefined' && navigator.language?.startsWith('zh') ? 'zh' : 'en';
  const events: TimelineEvent[] = [];

  for (const job of jobs) {
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

    // 改动 1: Applied Event — 只要存在任意 applied 类 completed stage 就生成
    const hasCompletedApplied = allStages.some(({ stage }) => {
      const cat = stage.category || detectStageCategory(stage.name);
      return ['application', 'resume_screen', 'hr_screen'].includes(cat) && stage.status === 'completed';
    });
    if (hasCompletedApplied) {
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
    }

    // Process individual stage events
    for (const { stage, job: j } of allStages) {
      const cat = stage.category || detectStageCategory(stage.name);
      const type: EventType = getEventTypeFromStage(stage);

      // 改动 2: 只跳过 application 类别本身，resume_screen/hr_screen 正常生成事件
      if (cat === 'application') continue;

      // 改动 5: 分离 scheduledTime/date 和 deadline
      const eventTime = stage.scheduledTime || stage.date;
      const deadlineTime = stage.deadline;

      // 改动 4: 同阶段同日 scheduled + completed 合并
      const isCompletedSameDay = stage.status === 'completed'
        && stage.completedAt && eventTime
        && isSameDay(parseISO(stage.completedAt), parseISO(eventTime));

      // Scheduled event (only if not completed on the same day)
      if (eventTime && !isCompletedSameDay) {
        let sublabel: string | undefined;
        if (stage.scheduledTime && stage.scheduledTimezone) {
          try { sublabel = formatDualTimezone(stage.scheduledTime, stage.scheduledTimezone); } catch { /* ignore */ }
        }
        events.push({
          id: `stage-${j.id}-${stage.id}`,
          type,
          date: parseISO(eventTime),
          jobId: j.id,
          companyName: j.companyName,
          roleTitle: j.roleTitle,
          jobLink: j.jobLink,
          label: `${j.companyName} — ${stage.name}`,
          sublabel,
          stageName: stage.name,
        });
      }

      // 改动 5: Deadline event — separate from scheduled
      if (deadlineTime && deadlineTime !== eventTime) {
        events.push({
          id: `deadline-${j.id}-${stage.id}`,
          type,
          date: parseISO(deadlineTime),
          jobId: j.id,
          companyName: j.companyName,
          roleTitle: j.roleTitle,
          jobLink: j.jobLink,
          label: `${j.companyName} — ${stage.name}`,
          stageName: stage.name,
          isDeadline: true,
        });
      }

      // Scheduling action event
      if (stage.status === 'scheduled' && (stage.scheduledTime || stage.date)) {
        const scheduledDate = stage.scheduledTime || stage.date!;
        const actionDate = j.updatedAt || j.createdAt;
        const scheduledLabel = format(parseISO(scheduledDate), lang === 'zh' ? 'M月d日 HH:mm' : 'MMM d, HH:mm');
        events.push({
          id: `scheduling-${j.id}-${stage.id}`,
          type,
          date: parseISO(actionDate),
          jobId: j.id,
          companyName: j.companyName,
          roleTitle: j.roleTitle,
          jobLink: j.jobLink,
          label: `${j.companyName} — ${stage.name}`,
          sublabel: scheduledLabel,
          stageName: stage.name,
          isSchedulingAction: true,
        });
      }

      // 改动 3: Completion event — 收紧 fallback，不用 job.updatedAt
      if (stage.status === 'completed') {
        const lowerName = stage.name.toLowerCase();
        if (lowerName === 'applied' || lowerName === '投递') continue;
        const completionDate = stage.completedAt || (stage as any).updatedAt;
        if (!completionDate) continue; // 没有可靠时间，不生成
        events.push({
          id: `completed-${j.id}-${stage.id}`,
          type,
          date: parseISO(completionDate),
          jobId: j.id,
          companyName: j.companyName,
          roleTitle: j.roleTitle,
          jobLink: j.jobLink,
          label: `${j.companyName} — ${stage.name}`,
          stageName: stage.name,
          isCompleted: true,
        });
      }
    }
  }
  return events;
}

const EVENT_ICONS: Record<EventType, typeof FileText> = {
  applied: FileText,
  interview: Mic,
  assessment: ClipboardCheck,
  written_test: PenLine,
  offer: Gift,
  other: Circle,
};

const EVENT_COLORS: Record<EventType, string> = {
  applied: 'text-[hsl(210,30%,50%)]',
  interview: 'text-[hsl(32,45%,46%)]',
  assessment: 'text-[hsl(232,36%,36%)]',
  written_test: 'text-[hsl(260,25%,52%)]',
  offer: 'text-[hsl(158,25%,42%)]',
  other: 'text-muted-foreground',
};

const CATEGORY_ORDER: EventType[] = ['applied', 'assessment', 'written_test', 'interview', 'offer', 'other'];

function EventRow({ event, navigate }: { event: TimelineEvent; navigate: (path: string) => void }) {
  const { t } = useTranslation();
  const Icon = event.isDeadline ? Timer : event.isSchedulingAction ? CalendarPlus : event.isCompleted ? CheckCircle2 : EVENT_ICONS[event.type];
  const suffix = event.isDeadline
    ? ` (${t('timeTracker.deadline_suffix')})`
    : event.isSchedulingAction
    ? ` (${t('timeTracker.scheduled_suffix')})`
    : event.isCompleted ? ` (${t('timeTracker.completed_suffix')})` : '';
  const iconColor = event.isDeadline
    ? 'text-[hsl(350,30%,52%)]'
    : event.isSchedulingAction
    ? 'text-[hsl(210,30%,50%)]'
    : event.isCompleted ? 'text-[hsl(158,30%,38%)]' : EVENT_COLORS[event.type];
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group"
      onClick={() => navigate(`/jobs/${event.jobId}`)}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', iconColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium truncate', event.isSchedulingAction ? 'text-muted-foreground' : 'text-foreground')}>{event.label}{suffix}</span>
          {event.jobLink && (
            <a href={event.jobLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
            </a>
          )}
        </div>
        {event.sublabel && <p className="text-xs text-muted-foreground mt-0.5">{event.isSchedulingAction ? `📅 ${event.sublabel}` : event.sublabel}</p>}
      </div>
      <Badge variant="secondary" className="text-[10px] shrink-0">
        {event.isCompleted ? `✓ ${t(`timeTracker.type_${event.type}`)}` : t(`timeTracker.type_${event.type}`)}
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

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (viewMode === 'day') {
      return { rangeStart: startOfDay(selectedDate), rangeEnd: endOfDay(selectedDate) };
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

  const summary = useMemo(() => {
    const counts: Record<EventType, number> = { applied: 0, interview: 0, assessment: 0, written_test: 0, offer: 0, other: 0 };
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

          {!isToday(selectedDate) && (
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setSelectedDate(new Date())}>
              <CalendarDays className="w-3.5 h-3.5 mr-1" />
              {t('timeTracker.today')}
            </Button>
          )}

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
            {summary.written_test > 0 && <span className="flex items-center gap-1"><PenLine className="w-3.5 h-3.5 text-indigo-500" />{summary.written_test} {t('timeTracker.type_written_test')}</span>}
            {summary.interview > 0 && <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5 text-amber-500" />{summary.interview} {t('timeTracker.type_interview')}</span>}
            {summary.offer > 0 && <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5 text-emerald-500" />{summary.offer} {t('timeTracker.type_offer')}</span>}
            {summary.other > 0 && <span className="flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-muted-foreground" />{summary.other} {t('timeTracker.type_other')}</span>}
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
