import { Job } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PipelineStatus } from './PipelineStatus';
import { resolvePipeline } from '@/lib/pipeline-resolver';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const resolution = resolvePipeline(job);
  const isTerminal = resolution.state.type === 'rejected' || 
                     resolution.state.type === 'withdrawn' || 
                     job.status === 'closed';

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-3.5 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/30 group",
        isTerminal && "opacity-75 bg-muted/30"
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "font-semibold text-sm truncate transition-colors",
              isTerminal 
                ? "text-muted-foreground" 
                : "text-foreground group-hover:text-primary"
            )}>
              {job.companyName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {job.roleTitle}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className="text-[10px] font-medium bg-muted text-muted-foreground shrink-0"
          >
            {job.location}
          </Badge>
        </div>

        <PipelineStatus job={job} resolution={resolution} />
      </div>
    </Card>
  );
}
