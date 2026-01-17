import { Job } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

// Format scheduled time for display on card (e.g., "2026-01-22 周三22:00")
function formatScheduledTime(scheduledTime: string): string {
  try {
    const date = parseISO(scheduledTime);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = format(date, 'EEEE', { locale: zhCN }).replace('星期', '周');
    const timeStr = format(date, 'HH:mm');
    
    return `${dateStr} ${dayOfWeek}${timeStr}`;
  } catch {
    return scheduledTime;
  }
}

export function JobCard({ job, onClick }: JobCardProps) {
  const completedStages = job.stages.filter(s => s.status === 'completed').length;
  const totalStages = job.stages.length;
  const progress = (completedStages / totalStages) * 100;

  // Find next upcoming interview from Interview Timeline (single source of truth)
  const nextUpcomingEvent = useMemo(() => {
    const upcomingStages = job.stages.filter(s => 
      s.status === 'upcoming' && s.scheduledTime
    );
    
    if (upcomingStages.length === 0) return null;
    
    // Sort by scheduled time and get the earliest
    upcomingStages.sort((a, b) => 
      (a.scheduledTime || '').localeCompare(b.scheduledTime || '')
    );
    
    return upcomingStages[0];
  }, [job.stages]);

  const locationColors: Record<string, string> = {
    CN: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    US: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Remote: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <Card
      onClick={onClick}
      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 group"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {job.companyName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {job.roleTitle}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={cn('shrink-0 text-xs font-medium', locationColors[job.location])}
          >
            {job.location}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {job.currentStage || job.stages.find(s => s.status === 'upcoming')?.name || 'Applied'}
            </span>
            <span className="text-muted-foreground">
              {completedStages}/{totalStages}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Next Action - Derived from Interview Timeline */}
        {nextUpcomingEvent && nextUpcomingEvent.scheduledTime && (
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <ArrowRight className="w-3 h-3" />
            <span className="truncate">
              {formatScheduledTime(nextUpcomingEvent.scheduledTime)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
