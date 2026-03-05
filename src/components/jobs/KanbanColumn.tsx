import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Job, KanbanColumnType, KANBAN_COLUMN_CONFIG, ApplicationAssessmentFilter, APPLICATION_ASSESSMENT_FILTERS, APPLICATION_ASSESSMENT_FILTER_CONFIG, deriveApplicationSubCategory } from '@/types/job';
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
  const [activeFilter, setActiveFilter] = useState<ApplicationAssessmentFilter>('application');

  const showFilters = column === 'application_assessment';

  const filteredJobs = useMemo(() => {
    if (!showFilters || activeFilter === 'all') return jobs;
    return jobs.filter(job => deriveApplicationSubCategory(job) === activeFilter);
  }, [jobs, activeFilter, showFilters]);

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] flex-1">
      {/* Column Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          <h3 className="font-medium text-foreground text-sm">{t(config.labelKey)}</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredJobs.length}
          </span>
        </div>

        {/* Filter Pills for application_assessment column */}
        {showFilters && (
          <div className="flex flex-wrap gap-1 mt-2">
            {APPLICATION_ASSESSMENT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-medium transition-all',
                  activeFilter === filter
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {t(APPLICATION_ASSESSMENT_FILTER_CONFIG[filter].labelKey)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pb-4 p-1.5 -m-1.5 rounded-lg">
        {filteredJobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onClick={() => onJobClick(job)} 
          />
        ))}
        
        {filteredJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground border-2 border-dashed border-muted rounded-lg">
            <Inbox className="w-5 h-5 text-muted-foreground/30" />
            <span className="text-xs">{t('jobs.noJobsInColumn')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
