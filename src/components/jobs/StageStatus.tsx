import { cn } from '@/lib/utils';
import { InterviewStage, JobStatus, ClosedReason } from '@/types/job';
import { ArrowRight, Check, X, Star, Clock, SkipForward, Loader2 } from 'lucide-react';
import { parseInTimezone, formatInTimezone } from '@/lib/timezone';

interface StageStatusProps {
  stages: InterviewStage[];
  jobStatus: JobStatus;
  closedReason?: ClosedReason;
}

// Format scheduled time for display
function formatScheduledTime(scheduledTime: string, timezone: string): string {
  try {
    const utcDate = parseInTimezone(scheduledTime, timezone);
    const formatted = formatInTimezone(utcDate, timezone, 'MMM d · HH:mm');
    const tzLabel = timezone === 'Asia/Shanghai' ? '北京时间' : 
                    timezone === 'America/New_York' ? 'ET' : 
                    timezone.split('/')[1] || '';
    return `${formatted} ${tzLabel}`;
  } catch {
    return scheduledTime;
  }
}

type StatusType = 'pending' | 'completed' | 'rejected' | 'offer' | 'skipped' | 'waiting' | 'applied';

interface DerivedStatus {
  type: StatusType;
  stageName: string;
  scheduledTime?: string;
  scheduledTimezone?: string;
}

// Derive the most relevant status from stages
function deriveStatus(stages: InterviewStage[], jobStatus: JobStatus, closedReason?: ClosedReason): DerivedStatus {
  // Handle offer status
  if (jobStatus === 'offer') {
    const offerStage = stages.find(s => s.name.toLowerCase().includes('offer'));
    return {
      type: 'offer',
      stageName: offerStage?.name || 'Offer',
    };
  }

  // Handle closed/rejected status
  if (jobStatus === 'closed') {
    const lastCompleted = [...stages].reverse().find(s => s.status === 'completed');
    return {
      type: 'rejected',
      stageName: lastCompleted?.name || 'Application',
    };
  }

  // Find the furthest progressed stage
  // Priority: first pending stage > last completed stage
  const pendingStage = stages.find(s => s.status === 'upcoming');
  const lastCompletedIndex = stages.map((s, i) => s.status === 'completed' ? i : -1).filter(i => i >= 0).pop();
  const lastCompleted = lastCompletedIndex !== undefined ? stages[lastCompletedIndex] : null;

  // Check for skipped stages
  const skippedStage = stages.find(s => s.status === 'skipped');

  // If there's a pending stage with scheduled time, show it
  if (pendingStage) {
    return {
      type: 'pending',
      stageName: pendingStage.name,
      scheduledTime: pendingStage.scheduledTime,
      scheduledTimezone: pendingStage.scheduledTimezone || 'Asia/Shanghai',
    };
  }

  // If all stages completed but no offer yet - waiting for feedback
  if (lastCompleted && !pendingStage) {
    return {
      type: 'waiting',
      stageName: lastCompleted.name,
    };
  }

  // Show last completed stage
  if (lastCompleted) {
    return {
      type: 'completed',
      stageName: lastCompleted.name,
    };
  }

  // Default: Applied
  return {
    type: 'applied',
    stageName: 'Applied',
  };
}

// Status configuration
const STATUS_CONFIG: Record<StatusType, {
  icon: typeof ArrowRight;
  label: (name: string) => string;
  iconClass: string;
  textClass: string;
}> = {
  pending: {
    icon: ArrowRight,
    label: (name) => `Next: ${name}`,
    iconClass: 'text-primary',
    textClass: 'text-foreground font-medium',
  },
  completed: {
    icon: Check,
    label: (name) => `Completed: ${name}`,
    iconClass: 'text-chart-2',
    textClass: 'text-chart-2 font-medium',
  },
  rejected: {
    icon: X,
    label: (name) => `Rejected after ${name}`,
    iconClass: 'text-destructive',
    textClass: 'text-destructive font-medium',
  },
  offer: {
    icon: Star,
    label: () => 'Offer Received',
    iconClass: 'text-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400 font-semibold',
  },
  skipped: {
    icon: SkipForward,
    label: (name) => `Skipped ${name}`,
    iconClass: 'text-muted-foreground',
    textClass: 'text-muted-foreground font-medium',
  },
  waiting: {
    icon: Clock,
    label: (name) => `Awaiting feedback · ${name}`,
    iconClass: 'text-amber-500',
    textClass: 'text-foreground font-medium',
  },
  applied: {
    icon: ArrowRight,
    label: () => 'Applied',
    iconClass: 'text-muted-foreground',
    textClass: 'text-muted-foreground font-medium',
  },
};

export function StageStatus({ stages, jobStatus, closedReason }: StageStatusProps) {
  const status = deriveStatus(stages, jobStatus, closedReason);
  const config = STATUS_CONFIG[status.type];
  const Icon = config.icon;

  return (
    <div className="space-y-1 animate-fade-in">
      {/* Primary status line */}
      <div className="flex items-center gap-1.5">
        <Icon className={cn('w-4 h-4 shrink-0', config.iconClass)} />
        <span className={cn('text-sm truncate', config.textClass)}>
          {config.label(status.stageName)}
        </span>
      </div>

      {/* Secondary: scheduled time */}
      {status.scheduledTime && status.scheduledTimezone && (
        <div className="flex items-center gap-1.5 pl-5.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{formatScheduledTime(status.scheduledTime, status.scheduledTimezone)}</span>
        </div>
      )}
    </div>
  );
}
