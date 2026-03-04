import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, FileText, Mic, ClipboardCheck, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDualTimezone } from '@/lib/timezone';
import { Job, InterviewStage } from '@/types/job';

type EventType = 'applied' | 'interview' | 'assessment';
type FilterRange = 'week' | 'month' | 'all';

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
    // Application event
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

    // Extract interview/assessment events from pipelines and legacy stages
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
        try {
          sublabel = formatDualTimezone(stage.scheduledTime, stage.scheduledTimezone);
        } catch {
          // ignore formatting errors
        }
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

const TYPE_ORDER: Record<EventType, number> = { applied: 0, assessment: 1, interview: 2 };

function groupByDate(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const map = new Map<string, TimelineEvent[]>();
  for (const event of events) {
    const key = format(event.date, 'yyyy-MM-dd');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(event);
  }
  // Sort: by type order, then by time descending
  for (const [, evts] of map) {
    evts.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || b.date.getTime() - a.date.getTime());
  }
  return map;
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

export default function TimeTracker() {
  const { t, i18n } = useTranslation();
  const { jobs } = useJobs();
  const navigate = useNavigate();
  const locale = i18n.language === 'zh' ? zhCN : enUS;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterRange, setFilterRange] = useState<FilterRange>('month');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');

  const allEvents = useMemo(() => extractEvents(jobs), [jobs]);

  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    if (filterRange === 'month') {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      filtered = filtered.filter(e => isWithinInterval(e.date, { start, end }));
    } else if (filterRange === 'week') {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });
      filtered = filtered.filter(e => isWithinInterval(e.date, { start, end }));
    }

    return filtered;
  }, [allEvents, filterType, filterRange, currentMonth]);

  const grouped = useMemo(() => groupByDate(filteredEvents), [filteredEvents]);
  const sortedDates = useMemo(() => [...grouped.keys()].sort((a, b) => b.localeCompare(a)), [grouped]);

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    const todayLabel = isToday(date) ? ` (${t('timeTracker.today')})` : '';
    return format(date, i18n.language === 'zh' ? 'M月d日，EEEE' : 'MMMM d, yyyy — EEEE', { locale }) + todayLabel;
  };

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
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[120px] text-center">
              {format(currentMonth, i18n.language === 'zh' ? 'yyyy年M月' : 'MMMM yyyy', { locale })}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            {(['week', 'month', 'all'] as FilterRange[]).map(r => (
              <Button key={r} variant={filterRange === r ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setFilterRange(r)}>
                {t(`timeTracker.range_${r}`)}
              </Button>
            ))}
          </div>

          <div className="flex gap-1 ml-auto">
            {(['all', 'applied', 'interview', 'assessment'] as const).map(type => (
              <Badge key={type} variant={filterType === type ? 'default' : 'outline'} className="cursor-pointer text-xs" onClick={() => setFilterType(type)}>
                {t(`timeTracker.type_${type}`)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {sortedDates.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('timeTracker.noEvents')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(dateStr => {
              const events = grouped.get(dateStr)!;
              return (
                <div key={dateStr}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                      {formatDateHeader(dateStr)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-2 pl-2">
                    {events.map(event => {
                      const Icon = EVENT_ICONS[event.type];
                      return (
                        <div
                          key={event.id}
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
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
