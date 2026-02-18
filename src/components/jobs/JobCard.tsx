import { Job } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { SubStatusBadge, RiskTagBadge, ClosedReasonBadge } from './StatusBadge';
import { PipelineStatus } from './PipelineStatus';
import { resolvePipeline } from '@/lib/pipeline-resolver';

interface JobCardProps {
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

export function JobCard({ job, onClick }: JobCardProps) {
  // Get pipeline resolution to check if job is terminal
  const resolution = resolvePipeline(job);
  const isTerminal = resolution.state.type === 'rejected' || 
                     resolution.state.type === 'withdrawn' || 
                     job.status === 'closed';
  
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

  const locationClass = 'bg-muted text-muted-foreground';

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 group",
        // Dimmed styling for closed/terminal jobs
        isTerminal && "opacity-75 bg-muted/30"
      )}
    >
      <div className="space-y-3">
        {/* Header with location and sub-status/risk */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "font-semibold truncate transition-colors",
              isTerminal 
                ? "text-muted-foreground" 
                : "text-foreground group-hover:text-primary"
            )}>
              {job.companyName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {job.roleTitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge 
              variant="secondary" 
              className={cn('text-xs font-medium', locationClass)}
            >
              {job.location}
            </Badge>
          </div>
        </div>


        {/* Pipeline status - single momentum line using resolver */}
        <PipelineStatus job={job} />
      </div>
    </Card>
  );
}
