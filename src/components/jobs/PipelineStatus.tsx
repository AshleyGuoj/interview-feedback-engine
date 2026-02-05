import { cn } from '@/lib/utils';
import { Job } from '@/types/job';
import { resolvePipeline, getStateDisplayConfig, formatScheduledTime } from '@/lib/pipeline-resolver';
import { StatusIcon } from '@/components/ui/status-icon';
import { Calendar } from 'lucide-react';

interface PipelineStatusProps {
  job: Job;
  compact?: boolean;
}

/**
 * Displays the resolved pipeline status for a job
 * Uses the Pipeline Resolver to determine the current state
 */
export function PipelineStatus({ job, compact = false }: PipelineStatusProps) {
  const resolution = resolvePipeline(job);
  const { state } = resolution;
  const displayConfig = getStateDisplayConfig(state);

  // Get scheduled time if available for next_interview state
  const scheduledTime = state.type === 'next_interview' && state.stage.scheduledTime
    ? formatScheduledTime(state.stage.scheduledTime, state.stage.scheduledTimezone)
    : null;

  // Get status text based on state type
  const getStatusText = () => {
    switch (state.type) {
      case 'next_interview':
        if (state.stage.status === 'scheduled' && scheduledTime) {
          return `${state.stage.name} · ${scheduledTime}`;
        }
        if (state.stage.status === 'rescheduled') {
          return `${state.stage.name} · Rescheduled`;
        }
        return `Next: ${state.stage.name}`;
      
      case 'awaiting_decision':
        return state.label;
      
      case 'rejected':
        return state.label;
      
      case 'on_hold':
        return state.label;
      
      case 'offer':
        return 'Offer Received';
      
      case 'withdrawn':
        return 'Withdrawn';
      
      case 'applied':
      default:
        return 'Applied';
    }
  };

  if (compact) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full',
        displayConfig.bgColor,
        displayConfig.textColor
      )}>
        <StatusIcon iconName={displayConfig.icon} color={displayConfig.color} size="sm" />
        <span className="truncate max-w-[140px]">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1 animate-fade-in">
      {/* Primary status line */}
      <div className="flex items-center gap-1.5">
        <StatusIcon iconName={displayConfig.icon} color={displayConfig.color} size="md" />
        <span className={cn('text-sm truncate font-medium', displayConfig.textColor)}>
          {getStatusText()}
        </span>
      </div>

      {/* Secondary: scheduled time for next interview */}
      {state.type === 'next_interview' && state.stage.scheduledTime && state.stage.status !== 'scheduled' && (
        <div className="flex items-center gap-1.5 pl-5.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{scheduledTime}</span>
        </div>
      )}
    </div>
  );
}
