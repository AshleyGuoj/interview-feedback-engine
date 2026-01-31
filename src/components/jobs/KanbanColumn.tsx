import { Job, JobStatus } from '@/types/job';
import { DraggableJobCard } from './DraggableJobCard';
import { InsightStrip } from './InsightStrip';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

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
  
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          <h3 className="font-medium text-foreground">{config.label}</h3>
          <span className="text-sm text-muted-foreground ml-auto">
            {jobs.length}
          </span>
        </div>
        
        {/* Insight Strip - sub-status breakdown */}
        <InsightStrip status={status} jobs={jobs} />
      </div>

      {/* Cards Container */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-3 overflow-y-auto pb-4 p-2 -m-2 rounded-lg transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary/20"
        )}
      >
        <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <DraggableJobCard 
              key={job.id} 
              job={job} 
              onClick={() => onJobClick(job)} 
            />
          ))}
        </SortableContext>
        
        {jobs.length === 0 && (
          <div className={cn(
            "text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-muted rounded-lg transition-colors",
            isOver && "border-primary/50 bg-primary/10"
          )}>
            {isOver ? "Drop here" : "No jobs yet"}
          </div>
        )}
      </div>
    </div>
  );
}
