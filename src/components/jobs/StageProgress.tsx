import { cn } from '@/lib/utils';
import { InterviewStage } from '@/types/job';

interface StageProgressProps {
  stages: InterviewStage[];
  currentStageName?: string;
}

// Define stage groups for semantic progress
const STAGE_GROUPS = [
  { key: 'apply', names: ['Applied', 'Application'], label: 'Applied' },
  { key: 'hr', names: ['HR Screen', 'HR'], label: 'HR' },
  { key: 'interview', names: ['Round 1', 'Round 2', 'Round 3', 'Technical', 'Behavioral', 'Panel'], label: 'Interview' },
  { key: 'final', names: ['Final Round', 'Final', 'Executive'], label: 'Final' },
  { key: 'offer', names: ['Offer Discussion', 'Offer', 'Negotiation'], label: 'Offer' },
];

export function StageProgress({ stages, currentStageName }: StageProgressProps) {
  // Calculate which stage group we're in
  const completedStages = stages.filter(s => s.status === 'completed');
  const lastCompletedName = completedStages[completedStages.length - 1]?.name || '';
  
  // Find current group index
  let currentGroupIndex = 0;
  for (let i = 0; i < STAGE_GROUPS.length; i++) {
    const group = STAGE_GROUPS[i];
    const matchesCompleted = group.names.some(n => 
      stages.some(s => s.name.includes(n) && s.status === 'completed')
    );
    const matchesCurrent = group.names.some(n => 
      currentStageName?.includes(n) || lastCompletedName.includes(n)
    );
    if (matchesCompleted || matchesCurrent) {
      currentGroupIndex = i;
    }
  }

  // Check if there are interview rounds
  const interviewRounds = stages.filter(s => 
    s.name.includes('Round') || 
    s.name.includes('Technical') || 
    s.name.includes('Behavioral')
  );
  const completedInterviewRounds = interviewRounds.filter(s => s.status === 'completed').length;
  const totalInterviewRounds = interviewRounds.length;

  return (
    <div className="space-y-1.5">
      {/* Stage dots */}
      <div className="flex items-center gap-1">
        {STAGE_GROUPS.map((group, index) => {
          const isCompleted = index < currentGroupIndex;
          const isCurrent = index === currentGroupIndex;
          const isUpcoming = index > currentGroupIndex;
          
          return (
            <div key={group.key} className="flex items-center">
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  isCompleted && 'bg-chart-2',
                  isCurrent && 'bg-primary ring-2 ring-primary/30',
                  isUpcoming && 'bg-muted-foreground/30'
                )}
              />
              {index < STAGE_GROUPS.length - 1 && (
                <div
                  className={cn(
                    'w-3 h-0.5 mx-0.5',
                    isCompleted ? 'bg-chart-2' : 'bg-muted-foreground/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current stage label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          {STAGE_GROUPS[currentGroupIndex]?.label || 'Applied'}
          {currentGroupIndex === 2 && totalInterviewRounds > 0 && (
            <span className="ml-1 text-muted-foreground/70">
              ({completedInterviewRounds}/{totalInterviewRounds})
            </span>
          )}
        </span>
        {currentStageName && currentStageName !== STAGE_GROUPS[currentGroupIndex]?.label && (
          <span className="text-muted-foreground/70 truncate max-w-[100px]">
            {currentStageName}
          </span>
        )}
      </div>
    </div>
  );
}
