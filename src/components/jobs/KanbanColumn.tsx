import { useTranslation } from 'react-i18next';
import { Job, KanbanColumnType, KANBAN_COLUMN_CONFIG } from '@/types/job';
import { JobCard } from './JobCard';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface KanbanColumnProps {
  column: KanbanColumnType;
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export function KanbanColumn({ column, jobs, onJobClick }: KanbanColumnProps) {
  const { t } = useTranslation();
  const config = KANBAN_COLUMN_CONFIG[column];

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] flex-1">
      {/* Column Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          <h3 className="font-medium text-foreground text-sm">{t(config.labelKey)}</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {jobs.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pb-4 p-1.5 -m-1.5 rounded-lg">
        {jobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onClick={() => onJobClick(job)} 
          />
        ))}
        
        {jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground border-2 border-dashed border-muted rounded-lg">
            <Inbox className="w-5 h-5 text-muted-foreground/30" />
            <span className="text-xs">{t('jobs.noJobsInColumn')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
