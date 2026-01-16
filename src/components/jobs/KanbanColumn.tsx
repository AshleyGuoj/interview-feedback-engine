import { Job, JobStatus } from '@/types/job';
import { JobCard } from './JobCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: JobStatus;
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

const columnConfig: Record<JobStatus, { label: string; color: string }> = {
  applied: { 
    label: 'Applied', 
    color: 'bg-slate-500' 
  },
  interviewing: { 
    label: 'Interviewing', 
    color: 'bg-amber-500' 
  },
  offer: { 
    label: 'Offer', 
    color: 'bg-emerald-500' 
  },
  closed: { 
    label: 'Closed', 
    color: 'bg-gray-400' 
  },
};

export function KanbanColumn({ status, jobs, onJobClick }: KanbanColumnProps) {
  const config = columnConfig[status];

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className={cn('w-2 h-2 rounded-full', config.color)} />
        <h3 className="font-medium text-foreground">{config.label}</h3>
        <span className="text-sm text-muted-foreground ml-auto">
          {jobs.length}
        </span>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {jobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onClick={() => onJobClick(job)} 
          />
        ))}
        
        {jobs.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-muted rounded-lg">
            No jobs yet
          </div>
        )}
      </div>
    </div>
  );
}
