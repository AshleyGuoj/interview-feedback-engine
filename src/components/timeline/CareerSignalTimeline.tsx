import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useJobs } from '@/contexts/JobsContext';
import { useLanguage } from '@/hooks/useLanguage';
import { CareerSignalTimeline as CareerSignalTimelineType } from '@/types/career-signals';
import { Job, InterviewStage } from '@/types/job';
import { supabase } from '@/integrations/supabase/client';
import { SignalTimelineItem } from './SignalTimelineItem';
import { MomentumIndicator } from './MomentumIndicator';
import { PatternsList } from './PatternsList';
import { CoachNote } from './CoachNote';
import { Button } from '@/components/ui/button';
import { TimelineLoadingState } from './TimelineLoadingState';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface JobEvent {
  jobId: string;
  company: string;
  role: string;
  eventType: string;
  date: string;
  stageName?: string;
  stageStatus?: string;
  stageResult?: string;
  questions?: Array<{ category: string; answeredWell?: boolean }>;
  reflection?: { overallFeeling: string; keyTakeaways: string[] };
}

function extractEvents(jobs: Job[]): JobEvent[] {
  const events: JobEvent[] = [];
  jobs.forEach(job => {
    const stages = job.pipelines?.length > 0
      ? job.pipelines.flatMap(p => p.stages)
      : job.stages || [];
    stages.forEach((stage: InterviewStage) => {
      if (stage.name.toLowerCase() === 'applied') return;
      const date = stage.scheduledTime
        ? new Date(stage.scheduledTime).toISOString().split('T')[0]
        : stage.date
          ? new Date(stage.date).toISOString().split('T')[0]
          : new Date(job.updatedAt).toISOString().split('T')[0];
      let eventType = 'stage_update';
      if (stage.status === 'completed') {
        eventType = stage.result === 'passed' ? 'interview_passed'
          : stage.result === 'rejected' ? 'interview_rejected'
          : stage.result === 'on_hold' ? 'interview_on_hold'
          : 'interview_completed';
      } else if (stage.status === 'scheduled') {
        eventType = 'interview_scheduled';
      } else if (stage.status === 'feedback_pending') {
        eventType = 'feedback_pending';
      }
      events.push({
        jobId: job.id, company: job.companyName, role: job.roleTitle,
        eventType, date, stageName: stage.name, stageStatus: stage.status,
        stageResult: stage.result || undefined,
        questions: stage.questions?.map(q => ({ category: q.category, answeredWell: q.answeredWell })),
        reflection: stage.reflection ? { overallFeeling: stage.reflection.overallFeeling, keyTakeaways: stage.reflection.keyTakeaways } : undefined,
      });
    });
  });
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return events;
}

export function CareerSignalTimeline() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { jobs } = useJobs();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const events = useMemo(() => extractEvents(jobs), [jobs]);

  const fetchSignals = useCallback(async (): Promise<CareerSignalTimelineType> => {
    const { data, error } = await supabase.functions.invoke('analyze-career-signals', {
      body: { events, language },
    });
    if (error) throw error;
    return data as CareerSignalTimelineType;
  }, [events, language]);

  const { data: signalData, isLoading, error, refetch } = useQuery({
    queryKey: ['career-signals', events.length, language],
    queryFn: fetchSignals,
    staleTime: 1000 * 60 * 5,
    enabled: events.length > 0,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success(t('common.save'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Empty state
  if (events.length === 0) {
    return (
      <div className="py-20 text-center max-w-[560px] mx-auto">
        <h3 className="text-[18px] font-semibold text-foreground mb-2">{t('timeline.noSignals')}</h3>
        <p className="text-[14px] text-muted-foreground leading-relaxed">
          {t('timeline.noSignalsHelper')}
        </p>
      </div>
    );
  }

  if (isLoading) return <TimelineLoadingState />;

  if (error || !signalData || !signalData.momentumStatus) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
        <h3 className="text-[15px] font-medium text-foreground mb-1">{t('ai.errorOccurred')}</h3>
        <p className="text-[13px] text-muted-foreground mb-4">{t('ai.tryAgain')}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const timeline = signalData;

  // Extract the hero signal — the first turning_point or strong_signal
  const heroItem = timeline.timelineItems.find(
    i => i.type === 'turning_point' || i.type === 'strong_signal'
  );
  const remainingItems = timeline.timelineItems.filter(i => i !== heroItem);

  return (
    <div className="space-y-10 max-w-[900px]">
      {/* Hero Signal Card — the focal point */}
      {heroItem && (
        <div className="py-8 px-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.08em] mb-4">
            {heroItem.type === 'turning_point' ? t('timeline.turningPoint') : t('timeline.strongSignal')}
          </p>
          <h2 className="text-[28px] sm:text-[34px] font-semibold text-foreground leading-[1.2] tracking-[-0.02em] mb-4">
            {heroItem.title}
          </h2>
          <p className="text-[16px] text-foreground/80 leading-[1.7] max-w-[640px] mb-3">
            {heroItem.signalSummary}
          </p>
          <p className="text-[14px] text-muted-foreground leading-[1.6] max-w-[600px]">
            {heroItem.whyItMatters}
          </p>
          {(heroItem.context.company || heroItem.context.role) && (
            <p className="text-[12px] text-muted-foreground/60 mt-4">
              {heroItem.context.company}{heroItem.context.role && ` · ${heroItem.context.role}`}
            </p>
          )}
        </div>
      )}

      {/* Refresh control — quiet, pushed right */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground/60">
          {t('timeline.basedOnEvents', { count: events.length })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-[12px] text-muted-foreground hover:text-foreground h-7"
        >
          <RefreshCw className={`w-3 h-3 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('timeline.refresh')}
        </Button>
      </div>

      {/* Momentum + Strategic Advisory — side by side, different visual weight */}
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <MomentumIndicator momentum={timeline.momentumStatus} />
        </div>
        <div className="md:col-span-3">
          <CoachNote note={timeline.coachNote} />
        </div>
      </div>

      {/* Patterns — borderless, memo-style */}
      {timeline.recentPatterns.length > 0 && (
        <PatternsList patterns={timeline.recentPatterns} />
      )}

      {/* Signal Timeline — remaining items */}
      <div className="space-y-3">
        <h2 className="text-[12px] font-medium text-muted-foreground/60 uppercase tracking-[0.06em]">
          {t('timeline.signalTimeline')}
        </h2>

        {remainingItems.length === 0 ? (
          <p className="text-[13px] text-muted-foreground py-6">
            {t('timeline.noSignificantSignals')}
          </p>
        ) : (
          <div className="relative space-y-3 pb-4">
            {remainingItems.map((item, index) => (
              <SignalTimelineItem
                key={`${item.date}-${index}`}
                item={item}
                isFirst={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
