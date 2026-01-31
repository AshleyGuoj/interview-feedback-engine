import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Job } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { SubStatusBadge, RiskTagBadge, ClosedReasonBadge } from './StatusBadge';
import { StageStatus } from './StageStatus';

interface DraggableJobCardProps {
  job: Job;
  onClick: () => void;
}

// Calculate days since last contact
function getDaysSinceContact(lastContactDate?: string): number | null {
  if (!lastContactDate) return null;
  const last = new Date(lastContactDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
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

  // Auto-detect long silence risk
  const daysSinceContact = getDaysSinceContact(job.lastContactDate);
  const hasLongSilence = daysSinceContact !== null && daysSinceContact >= 7;
  
  // Combine risk tags
  const allRiskTags = useMemo(() => {
    const tags = [...(job.riskTags || [])];
    if (hasLongSilence && !tags.includes('long_silence')) {
      tags.push('long_silence');
    }
    return tags;
  }, [job.riskTags, hasLongSilence]);

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
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge 
                    variant="secondary" 
                    className={cn('text-xs font-medium', locationColors[job.location])}
                  >
                    {job.location}
                  </Badge>
                  {/* Sub-status badge */}
                  {job.subStatus && job.status !== 'closed' && (
                    <SubStatusBadge subStatus={job.subStatus} size="sm" />
                  )}
                  {/* Closed reason badge */}
                  {job.status === 'closed' && job.closedReason && (
                    <ClosedReasonBadge reason={job.closedReason} size="sm" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Risk signals */}
          {allRiskTags.length > 0 && (
            <div className="flex flex-wrap gap-1" onClick={onClick}>
              {allRiskTags.slice(0, 3).map((tag) => (
                <RiskTagBadge key={tag} tag={tag} size="sm" />
              ))}
              {allRiskTags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{allRiskTags.length - 3}</span>
              )}
            </div>
          )}

          {/* Stage status - single momentum line */}
          <div onClick={onClick}>
            <StageStatus 
              stages={job.stages} 
              jobStatus={job.status}
              closedReason={job.closedReason}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
