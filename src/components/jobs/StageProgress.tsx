import { cn } from '@/lib/utils';
import { InterviewStage } from '@/types/job';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StageProgressProps {
  stages: InterviewStage[];
  currentStageName?: string;
}

const MAX_VISIBLE_NODES = 6;

export function StageProgress({ stages }: StageProgressProps) {
  if (!stages || stages.length === 0) return null;

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
        <div className="flex items-center gap-1">
          {visibleStages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isSkipped = stage.status === 'skipped';
            const isCurrent = index === effectiveCurrentIndex;
            const isUpcoming = stage.status === 'upcoming' && !isCurrent;

            return (
              <div key={stage.id} className="flex items-center">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'rounded-full transition-all duration-300 ease-out cursor-default',
                        // Size
                        isCurrent ? 'w-3 h-3' : 'w-2 h-2',
                        // Colors
                        isCompleted && 'bg-chart-2',
                        isCurrent && 'bg-primary ring-2 ring-primary/30 animate-pulse',
                        isUpcoming && 'bg-muted-foreground/30',
                        isSkipped && 'bg-transparent border-2 border-dashed border-muted-foreground/40'
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
                      'w-3 h-0.5 mx-0.5 transition-colors duration-300',
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
                  'w-3 h-0.5 mx-0.5 transition-colors duration-300',
                  visibleStages[visibleStages.length - 1]?.status === 'completed'
                    ? 'bg-chart-2'
                    : 'bg-muted-foreground/20'
                )}
              />
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex items-center justify-center rounded-full text-[9px] font-medium cursor-default transition-all duration-300',
                      overflowHasCurrent
                        ? 'w-5 h-5 bg-primary text-primary-foreground ring-2 ring-primary/30'
                        : 'w-5 h-5 bg-muted text-muted-foreground'
                    )}
                  >
                    +{overflowCount}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="space-y-0.5">
                    {overflowStages.map((stage, i) => (
                      <div key={stage.id} className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
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
