import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Job } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { parseInTimezone, formatInTimezone } from '@/lib/timezone';

interface DraggableJobCardProps {
  job: Job;
  onClick: () => void;
}

export function DraggableJobCard({ job, onClick }: DraggableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedStages = job.stages.filter(s => s.status === 'completed').length;
  const totalStages = job.stages.length;
  const progress = (completedStages / totalStages) * 100;

  const nextUpcomingStage = useMemo(() => {
    const upcomingStages = job.stages.filter(s => s.status === 'upcoming');
    if (upcomingStages.length === 0) return null;

    const withScheduledTime = upcomingStages.filter(s => s.scheduledTime);
    if (withScheduledTime.length > 0) {
      withScheduledTime.sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
      return withScheduledTime[0];
    }

    return upcomingStages[0];
  }, [job.stages]);

  const nextUpcomingLabel = useMemo(() => {
    if (!nextUpcomingStage) return null;

    if (!nextUpcomingStage.scheduledTime) return nextUpcomingStage.name;

    const originalTz = nextUpcomingStage.scheduledTimezone || 'Asia/Shanghai';
    const utcDate = parseInTimezone(nextUpcomingStage.scheduledTime, originalTz);
    const etDate = new Date(utcDate.getTime() + (-5) * 60 * 60 * 1000); // US Eastern offset
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const dayOfWeek = dayNames[etDate.getUTCDay()];
    const etDateStr = formatInTimezone(utcDate, 'America/New_York', 'M/d');
    const etHour = formatInTimezone(utcDate, 'America/New_York', 'HH:mm');

    return `${nextUpcomingStage.name} ${etDateStr} ${dayOfWeek} ${etHour} (美东)`;
  }, [nextUpcomingStage]);

  const locationColors: Record<string, string> = {
    CN: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    US: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Remote: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 group",
          isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
        )}
      >
        <div className="space-y-3">
          {/* Header with drag handle */}
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0" onClick={onClick}>
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
            </div>
          </div>

          {/* Progress - clickable */}
          <div className="space-y-1.5" onClick={onClick}>
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

          {/* Next Action - Stage + time (US Eastern) */}
          {nextUpcomingLabel && (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium" onClick={onClick}>
              <ArrowRight className="w-3 h-3" />
              <span className="truncate">{nextUpcomingLabel}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
