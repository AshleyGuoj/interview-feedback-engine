import { cn } from '@/lib/utils';
import { InterviewStage } from '@/types/job';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { forwardRef } from 'react';

interface StageProgressProps {
  stages: InterviewStage[];
  currentStageName?: string;
}

const MAX_VISIBLE_NODES = 6;

// ForwardRef wrapper for dot node
const DotNode = forwardRef<HTMLDivElement, { className: string }>(
  ({ className }, ref) => <div ref={ref} className={className} />
);
DotNode.displayName = 'DotNode';

// ForwardRef wrapper for overflow badge
const OverflowBadge = forwardRef<HTMLDivElement, { className: string; count: number }>(
  ({ className, count }, ref) => (
    <div ref={ref} className={className}>+{count}</div>
  )
);
OverflowBadge.displayName = 'OverflowBadge';

export function StageProgress({ stages }: StageProgressProps) {
  if (!stages || stages.length === 0) return null;

  const getStageKey = (stage: Partial<InterviewStage>, index: number) =>
    String((stage as InterviewStage).id ?? `${stage.name ?? 'stage'}-${index}`);

  // Find current stage index (first pending/upcoming stage)
  const currentIndex = stages.findIndex(s => s.status === 'upcoming');
  const effectiveCurrentIndex = currentIndex === -1 ? stages.length - 1 : currentIndex;

  // Calculate visible stages and overflow
  const hasOverflow = stages.length > MAX_VISIBLE_NODES;
  const visibleStages = hasOverflow ? stages.slice(0, MAX_VISIBLE_NODES - 1) : stages;
  const overflowCount = hasOverflow ? stages.length - (MAX_VISIBLE_NODES - 1) : 0;
  const overflowStages = hasOverflow ? stages.slice(MAX_VISIBLE_NODES - 1) : [];

  // Check if any overflow stage is current
  const overflowHasCurrent = hasOverflow && effectiveCurrentIndex >= MAX_VISIBLE_NODES - 1;

  return (
    <TooltipProvider>
      <div className="space-y-1.5">
        {/* Stage dots */}
        <div className="flex items-center">
          {visibleStages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isSkipped = stage.status === 'skipped';
            const isCurrent = index === effectiveCurrentIndex;
            const isUpcoming = stage.status === 'upcoming' && !isCurrent;

            return (
              <div key={getStageKey(stage, index)} className="flex items-center shrink-0">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <DotNode
                      className={cn(
                        'rounded-full transition-all duration-300 ease-out cursor-default shrink-0',
                        // Size
                        isCurrent ? 'w-2.5 h-2.5' : 'w-2 h-2',
                        // Colors
                        isCompleted && 'bg-chart-2',
                        isCurrent && 'bg-primary ring-2 ring-primary/30',
                        isUpcoming && 'bg-muted-foreground/30',
                        isSkipped && 'bg-transparent border border-dashed border-muted-foreground/40'
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <span className="font-medium">{stage.name}</span>
                    <span className="ml-1.5 text-muted-foreground capitalize">
                      ({stage.status})
                    </span>
                  </TooltipContent>
                </Tooltip>
                {index < visibleStages.length - 1 && (
                  <div
                    className={cn(
                      'w-2 h-0.5 mx-0.5 transition-colors duration-300 shrink-0',
                      isCompleted ? 'bg-chart-2' : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </div>
            );
          })}

          {/* Overflow indicator */}
          {hasOverflow && (
            <>
              <div
                className={cn(
                  'w-3 h-0.5 mx-0.5 transition-colors duration-300 shrink-0',
                  visibleStages[visibleStages.length - 1]?.status === 'completed'
                    ? 'bg-chart-2'
                    : 'bg-muted-foreground/20'
                )}
              />
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <OverflowBadge
                    count={overflowCount}
                    className={cn(
                      'flex items-center justify-center rounded-full text-[9px] font-medium cursor-default transition-all duration-300 shrink-0',
                      overflowHasCurrent
                        ? 'w-5 h-5 bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'w-5 h-5 bg-muted text-muted-foreground'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="space-y-0.5">
                    {overflowStages.map((stage, i) => (
                      <div key={getStageKey(stage, MAX_VISIBLE_NODES + i)} className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            stage.status === 'completed' && 'bg-chart-2',
                            stage.status === 'upcoming' && i === 0 && overflowHasCurrent && 'bg-primary',
                            stage.status === 'upcoming' && !(i === 0 && overflowHasCurrent) && 'bg-muted-foreground/40',
                            stage.status === 'skipped' && 'border border-dashed border-muted-foreground/40'
                          )}
                        />
                        <span>{stage.name}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Current stage label */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            {stages[effectiveCurrentIndex]?.name || stages[0]?.name}
          </span>
          <span className="text-muted-foreground/70">
            {stages.filter(s => s.status === 'completed').length}/{stages.length}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}
