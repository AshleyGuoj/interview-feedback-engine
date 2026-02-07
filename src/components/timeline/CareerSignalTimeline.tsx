import { useState, useMemo, useCallback } from 'react';
import { useJobs } from '@/contexts/JobsContext';
import { CareerSignalTimeline as CareerSignalTimelineType } from '@/types/career-signals';
import { Job, InterviewStage } from '@/types/job';
import { supabase } from '@/integrations/supabase/client';
import { SignalTimelineItem } from './SignalTimelineItem';
import { MomentumIndicator } from './MomentumIndicator';
import { PatternsList } from './PatternsList';
import { CoachNote } from './CoachNote';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Sparkles, Activity, AlertCircle } from 'lucide-react';
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
  questions?: Array<{
    category: string;
    answeredWell?: boolean;
  }>;
  reflection?: {
    overallFeeling: string;
    keyTakeaways: string[];
  };
}

// Transform jobs into events for analysis
function extractEvents(jobs: Job[]): JobEvent[] {
  const events: JobEvent[] = [];

  jobs.forEach(job => {
    const stages = job.pipelines?.length > 0 
      ? job.pipelines.flatMap(p => p.stages)
      : job.stages || [];

    stages.forEach((stage: InterviewStage) => {
      // Skip 'Applied' stage as it's not meaningful
      if (stage.name.toLowerCase() === 'applied') return;

      const date = stage.scheduledTime 
        ? new Date(stage.scheduledTime).toISOString().split('T')[0]
        : stage.date 
          ? new Date(stage.date).toISOString().split('T')[0]
          : new Date(job.updatedAt).toISOString().split('T')[0];

      // Determine event type based on status and result
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
        jobId: job.id,
        company: job.companyName,
        role: job.roleTitle,
        eventType,
        date,
        stageName: stage.name,
        stageStatus: stage.status,
        stageResult: stage.result || undefined,
        questions: stage.questions?.map(q => ({
          category: q.category,
          answeredWell: q.answeredWell,
        })),
        reflection: stage.reflection ? {
          overallFeeling: stage.reflection.overallFeeling,
          keyTakeaways: stage.reflection.keyTakeaways,
        } : undefined,
      });
    });
  });

  // Sort by date
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return events;
}

export function CareerSignalTimeline() {
  const { jobs } = useJobs();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const events = useMemo(() => extractEvents(jobs), [jobs]);

  const fetchSignals = useCallback(async (): Promise<CareerSignalTimelineType> => {
    const { data, error } = await supabase.functions.invoke('analyze-career-signals', {
      body: { events },
    });

    if (error) throw error;
    return data as CareerSignalTimelineType;
  }, [events]);

  const { data: signalData, isLoading, error, refetch } = useQuery({
    queryKey: ['career-signals', events.length],
    queryFn: fetchSignals,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: events.length > 0,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('信号分析已更新');
    } catch {
      toast.error('更新失败，请重试');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Empty state
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">暂无职业信号</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            开始记录你的面试经历，AI将帮助你发现职业发展中的关键信号和模式
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">正在分析职业信号...</span>
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Error state or no data
  if (error || !signalData || !signalData.momentumStatus) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive opacity-70" />
          <h3 className="font-semibold mb-2">分析失败</h3>
          <p className="text-sm text-muted-foreground mb-4">
            无法生成信号分析，请重试
          </p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  const timeline = signalData;

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            基于 {events.length} 个面试事件分析
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新分析
        </Button>
      </div>

      {/* Momentum + Coach Note */}
      <div className="grid gap-4 md:grid-cols-2">
        <MomentumIndicator momentum={timeline.momentumStatus} />
        <CoachNote note={timeline.coachNote} />
      </div>

      {/* Patterns */}
      {timeline.recentPatterns.length > 0 && (
        <PatternsList patterns={timeline.recentPatterns} />
      )}

      {/* Timeline Items */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          信号时间线
        </h2>
        
        {timeline.timelineItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                当前事件中没有发现显著信号
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative space-y-4 pb-4">
            {timeline.timelineItems.map((item, index) => (
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
