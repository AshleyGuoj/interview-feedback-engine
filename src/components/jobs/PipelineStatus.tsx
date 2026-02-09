import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Job } from '@/types/job';
import { resolvePipeline, getStateDisplayConfig, formatScheduledTime } from '@/lib/pipeline-resolver';
import { StatusIcon } from '@/components/ui/status-icon';
import { Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PipelineStatusProps {
  job: Job;
  compact?: boolean;
}

/**
 * Displays the resolved pipeline status for a job
 * Uses the Pipeline Resolver to determine the current state
 */
export function PipelineStatus({ job, compact = false }: PipelineStatusProps) {
  const { t } = useTranslation();
  const resolution = resolvePipeline(job);
  const { state } = resolution;
  const displayConfig = getStateDisplayConfig(state);

  // Get scheduled time if available for next_interview state
  const scheduledTime = state.type === 'next_interview' && state.stage.scheduledTime
    ? formatScheduledTime(state.stage.scheduledTime, state.stage.scheduledTimezone)
    : null;

  // Get status text based on state type - using "Status: Stage" format
  const getStatusText = () => {
    switch (state.type) {
      case 'next_interview':
        if (state.stage.status === 'scheduled') {
          // "Scheduled: Round Name"
          return t('jobs.statusWithStage', { 
            status: t('jobs.stageStatusScheduled'), 
            stage: state.stage.name 
          });
        }
        if (state.stage.status === 'rescheduled') {
          // "Rescheduled: Round Name"
          return t('jobs.statusWithStage', { 
            status: t('jobs.stageStatusRescheduled'), 
            stage: state.stage.name 
          });
        }
        // "Pending: Round Name"
        return t('jobs.statusWithStage', { 
          status: t('jobs.stageStatusPending'), 
          stage: state.stage.name 
        });
      
      case 'awaiting_decision':
        // "Feedback Pending: Round Name"
        return t('jobs.statusWithStage', { 
          status: t('jobs.stageStatusFeedbackPending'), 
          stage: state.lastStage.name 
        });
      
      case 'rejected':
        // "Rejected: Round Name"
        return t('jobs.statusWithStage', { 
          status: t('jobs.stageResultRejected'), 
          stage: state.atStage.name 
        });
      
      case 'on_hold':
        // "On Hold: Round Name" or "Ended: Round Name" for closed on_hold
        const onHoldStatus = state.label.startsWith('Ended') 
          ? t('jobs.ended')
          : t('jobs.stageResultOnHold');
        return t('jobs.statusWithStage', { 
          status: onHoldStatus, 
          stage: state.atStage.name 
        });
      
      case 'offer':
        return t('jobs.offerReceived');
      
      case 'withdrawn':
        return t('jobs.withdrawn');
      
      case 'applied':
      default:
        return t('jobs.applied');
    }
  };

  // Calculate progress for all state types
  const getProgressInfo = () => {
    const stages = resolution.activePipeline?.stages || job.stages || [];
    const total = stages.length;
    if (total === 0) return null;

    let current = 0;
    switch (state.type) {
      case 'applied':
        current = 0;
        break;
      case 'next_interview': {
        const idx = stages.findIndex(s => s.id === state.stage.id);
        current = idx >= 0 ? idx : 0;
        break;
      }
      case 'awaiting_decision': {
        const idx = stages.findIndex(s => s.id === state.lastStage.id);
        current = idx >= 0 ? idx + 1 : resolution.completedStages.length;
        break;
      }
      case 'rejected': {
        current = state.stageIndex + 1;
        break;
      }
      case 'on_hold': {
        const idx = stages.findIndex(s => s.id === state.atStage.id);
        current = idx >= 0 ? idx + 1 : resolution.completedStages.length;
        break;
      }
      case 'offer':
        current = total;
        break;
      case 'withdrawn': {
        current = resolution.completedStages.length;
        break;
      }
      default:
        current = 0;
    }
    const percentage = Math.round((current / total) * 100);
    return { current, total, percentage };
  };

  const progressInfo = getProgressInfo();
  const isTerminal = ['rejected', 'withdrawn', 'on_hold'].includes(state.type) || job.status === 'closed';

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
    <div className="space-y-2 animate-fade-in">
      {/* Primary status line */}
      <div className="flex items-center gap-1.5">
        <StatusIcon iconName={displayConfig.icon} color={displayConfig.color} size="md" />
        <span className={cn('text-sm truncate font-medium', displayConfig.textColor)}>
          {getStatusText()}
        </span>
      </div>

      {/* Secondary: scheduled time for scheduled/rescheduled interviews */}
      {state.type === 'next_interview' && scheduledTime && (
        <div className="flex items-center gap-1.5 pl-5.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{scheduledTime}</span>
        </div>
      )}

      {/* Progress bar for all states */}
      {progressInfo && progressInfo.total > 0 && (
        <div className="space-y-1">
          <Progress 
            value={progressInfo.percentage} 
            className="h-1.5 bg-muted"
            indicatorClassName="bg-foreground/25"
          />
          <p className="text-[10px] text-muted-foreground">
            {isTerminal
              ? t('jobs.completedStages', { completed: progressInfo.current, total: progressInfo.total })
              : t('jobs.stageProgress', { current: progressInfo.current, total: progressInfo.total })
            }
          </p>
        </div>
      )}
    </div>
  );
}
