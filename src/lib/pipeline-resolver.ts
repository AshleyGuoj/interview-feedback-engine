import { InterviewStage, Job, StageStatus, StageResult } from '@/types/job';

// Terminal states that indicate a stage/job is no longer active
const TERMINAL_RESULTS: StageResult[] = ['rejected'];
const TERMINAL_STATUSES: StageStatus[] = ['withdrawn', 'skipped'];

export type ResolvedPipelineState = 
  | { type: 'next_interview'; stage: InterviewStage; label: string }
  | { type: 'awaiting_decision'; lastStage: InterviewStage; label: string }
  | { type: 'rejected'; atStage: InterviewStage; label: string }
  | { type: 'on_hold'; atStage: InterviewStage; label: string }
  | { type: 'offer'; label: string }
  | { type: 'applied'; label: string }
  | { type: 'withdrawn'; label: string };

export interface PipelineResolution {
  state: ResolvedPipelineState;
  activeStage: InterviewStage | null;
  completedStages: InterviewStage[];
  shouldAutoActivateNext: boolean;
  suggestedNextAction?: string;
}

/**
 * Core Pipeline Resolver
 * Automatically calculates the current job's global state based on stage progression
 */
export function resolvePipeline(job: Job): PipelineResolution {
  const stages = job.stages;
  
  if (!stages || stages.length === 0) {
    return {
      state: { type: 'applied', label: 'Applied' },
      activeStage: null,
      completedStages: [],
      shouldAutoActivateNext: false,
    };
  }

  // Find completed stages and the active stage
  const completedStages: InterviewStage[] = [];
  let activeStage: InterviewStage | null = null;
  let rejectedStage: InterviewStage | null = null;
  let onHoldStage: InterviewStage | null = null;
  let withdrawnStage: InterviewStage | null = null;

  for (const stage of stages) {
    // Check for terminal states first
    if (stage.result === 'rejected') {
      rejectedStage = stage;
      break; // Stop processing - job is closed
    }
    
    if (stage.result === 'on_hold') {
      onHoldStage = stage;
      // Don't break - there might be more stages, but this is the blocker
    }
    
    if (stage.status === 'withdrawn') {
      withdrawnStage = stage;
      break; // Candidate withdrew
    }

    if (stage.status === 'completed') {
      completedStages.push(stage);
      // Check if passed and next stage should be activated
      if (stage.result === 'passed') {
        continue; // Move to next stage
      }
      // Completed but no result yet - this is the active stage
      if (!stage.result) {
        activeStage = stage;
        break;
      }
    } else if (stage.status === 'skipped') {
      continue; // Skip this stage
    } else {
      // First non-terminal, non-completed stage is the active one
      activeStage = stage;
      break;
    }
  }

  // === Determine the resolved state ===

  // Case 1: Candidate withdrew
  if (withdrawnStage) {
    return {
      state: { type: 'withdrawn', label: 'Withdrawn' },
      activeStage: withdrawnStage,
      completedStages,
      shouldAutoActivateNext: false,
    };
  }

  // Case 2: Rejected at some stage
  if (rejectedStage) {
    return {
      state: { 
        type: 'rejected', 
        atStage: rejectedStage, 
        label: `Rejected at ${rejectedStage.name}` 
      },
      activeStage: rejectedStage,
      completedStages,
      shouldAutoActivateNext: false,
    };
  }

  // Case 3: On Hold (HC Freeze)
  if (onHoldStage && !activeStage) {
    return {
      state: { 
        type: 'on_hold', 
        atStage: onHoldStage, 
        label: 'Hiring Freeze — Pipeline Paused' 
      },
      activeStage: onHoldStage,
      completedStages,
      shouldAutoActivateNext: false,
    };
  }

  // Case 4: Check for offer
  const offerStage = stages.find(s => 
    s.name.toLowerCase().includes('offer') && 
    s.status === 'completed' &&
    s.result === 'passed'
  );
  if (offerStage || job.status === 'offer') {
    return {
      state: { type: 'offer', label: 'Offer Received' },
      activeStage: offerStage || null,
      completedStages,
      shouldAutoActivateNext: false,
    };
  }

  // Case 5: Has active stage with pending/scheduled status
  if (activeStage) {
    const pendingStatuses: StageStatus[] = ['pending', 'scheduled', 'rescheduled'];
    
    if (pendingStatuses.includes(activeStage.status)) {
      // Next interview is coming up
      return {
        state: { 
          type: 'next_interview', 
          stage: activeStage, 
          label: `${activeStage.name}` 
        },
        activeStage,
        completedStages,
        shouldAutoActivateNext: false,
        suggestedNextAction: activeStage.scheduledTime 
          ? `Interview on ${new Date(activeStage.scheduledTime).toLocaleDateString()}`
          : 'Schedule interview',
      };
    }

    // Completed but awaiting feedback/result
    if (activeStage.status === 'completed' && !activeStage.result) {
      return {
        state: { 
          type: 'awaiting_decision', 
          lastStage: activeStage, 
          label: `Awaiting Decision · ${activeStage.name}` 
        },
        activeStage,
        completedStages,
        shouldAutoActivateNext: false,
      };
    }

    // Feedback pending status
    if (activeStage.status === 'feedback_pending') {
      return {
        state: { 
          type: 'awaiting_decision', 
          lastStage: activeStage, 
          label: `Awaiting Decision · ${activeStage.name}` 
        },
        activeStage,
        completedStages,
        shouldAutoActivateNext: false,
      };
    }
  }

  // Case 6: All stages completed with results - check if need to auto-activate next
  const lastCompleted = completedStages[completedStages.length - 1];
  if (lastCompleted && lastCompleted.result === 'passed') {
    // Find next stage that should be activated
    const lastIndex = stages.findIndex(s => s.id === lastCompleted.id);
    const nextStage = stages[lastIndex + 1];
    
    if (nextStage && nextStage.status === 'pending') {
      return {
        state: { 
          type: 'next_interview', 
          stage: nextStage, 
          label: `${nextStage.name}` 
        },
        activeStage: nextStage,
        completedStages,
        shouldAutoActivateNext: true, // Signal that we should auto-activate
      };
    }

    // No more stages - awaiting final decision or offer
    if (!nextStage) {
      return {
        state: { 
          type: 'awaiting_decision', 
          lastStage: lastCompleted, 
          label: `Awaiting Decision · ${lastCompleted.name}` 
        },
        activeStage: lastCompleted,
        completedStages,
        shouldAutoActivateNext: false,
      };
    }
  }

  // Default: Applied state
  return {
    state: { type: 'applied', label: 'Applied' },
    activeStage: stages[0] || null,
    completedStages,
    shouldAutoActivateNext: false,
  };
}

/**
 * Get display configuration for the resolved state
 */
export function getStateDisplayConfig(state: ResolvedPipelineState): {
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
} {
  switch (state.type) {
    case 'next_interview':
      return {
        icon: 'arrow-right',
        color: 'primary',
        bgColor: 'bg-primary/10',
        textColor: 'text-primary',
      };
    case 'awaiting_decision':
      return {
        icon: 'clock',
        color: 'amber',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-400',
      };
    case 'rejected':
      return {
        icon: 'x-circle',
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-400',
      };
    case 'on_hold':
      return {
        icon: 'snowflake',
        color: 'cyan',
        bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
        textColor: 'text-cyan-700 dark:text-cyan-400',
      };
    case 'offer':
      return {
        icon: 'trophy',
        color: 'amber',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-500',
      };
    case 'withdrawn':
      return {
        icon: 'undo-2',
        color: 'gray',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-600 dark:text-gray-400',
      };
    case 'applied':
    default:
      return {
        icon: 'send',
        color: 'gray',
        bgColor: 'bg-muted',
        textColor: 'text-muted-foreground',
      };
  }
}

/**
 * Format scheduled time for display
 */
export function formatScheduledTime(scheduledTime: string, timezone?: string): string {
  try {
    const date = new Date(scheduledTime);
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return scheduledTime;
  }
}
