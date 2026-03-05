import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Job, KanbanColumnType, KANBAN_COLUMN_CONFIG, 
  ApplicationAssessmentFilter, APPLICATION_ASSESSMENT_FILTERS, APPLICATION_ASSESSMENT_FILTER_CONFIG, deriveApplicationSubCategory,
  InterviewFilter, INTERVIEW_FILTERS, INTERVIEW_FILTER_CONFIG, deriveInterviewSubCategory,
} from '@/types/job';
import { JobCard } from './JobCard';
import { cn } from '@/lib/utils';
import { Inbox, ChevronDown, ChevronUp } from 'lucide-react';

interface KanbanColumnProps {
  column: KanbanColumnType;
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

const MAX_VISIBLE = 5;

export function KanbanColumn({ column, jobs, onJobClick }: KanbanColumnProps) {
  const { t } = useTranslation();
  const config = KANBAN_COLUMN_CONFIG[column];
  const [activeAppFilter, setActiveAppFilter] = useState<ApplicationAssessmentFilter>('all_application');
  const [activeIntFilter, setActiveIntFilter] = useState<InterviewFilter>('all_interview');
  const [expanded, setExpanded] = useState(false);

  const showAppFilters = column === 'application_assessment';
  const showIntFilters = column === 'interview';
  const hasFilters = showAppFilters || showIntFilters;

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (showAppFilters && activeAppFilter !== 'application') {
      result = jobs.filter(job => deriveApplicationSubCategory(job) === activeAppFilter);
    } else if (showIntFilters && activeIntFilter !== 'all_interview') {
      result = jobs.filter(job => deriveInterviewSubCategory(job) === activeIntFilter);
    }
    // Sort by createdAt descending (newest first)
    return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [jobs, activeAppFilter, activeIntFilter, showAppFilters, showIntFilters]);

  const hasMore = filteredJobs.length > MAX_VISIBLE;
  const visibleJobs = expanded ? filteredJobs : filteredJobs.slice(0, MAX_VISIBLE);
  const hiddenCount = filteredJobs.length - MAX_VISIBLE;

  // Reset expanded when filter changes
  const handleAppFilter = (f: ApplicationAssessmentFilter) => { setActiveAppFilter(f); setExpanded(false); };
  const handleIntFilter = (f: InterviewFilter) => { setActiveIntFilter(f); setExpanded(false); };

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] flex-1">
      {/* Column Header — fixed height area for alignment */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 mb-1">
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          <h3 className="font-medium text-foreground text-sm">{t(config.labelKey)}</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {filteredJobs.length}
          </span>
        </div>

        {/* Filter pills or spacer for alignment */}
        {showAppFilters ? (
          <div className="flex flex-wrap gap-1 mt-2 min-h-[28px]">
            {APPLICATION_ASSESSMENT_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => handleAppFilter(filter)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-medium transition-all',
                  activeAppFilter === filter
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {t(APPLICATION_ASSESSMENT_FILTER_CONFIG[filter].labelKey)}
              </button>
            ))}
          </div>
        ) : showIntFilters ? (
          <div className="flex flex-wrap gap-1 mt-2 min-h-[28px]">
            {INTERVIEW_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => handleIntFilter(filter)}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-medium transition-all',
                  activeIntFilter === filter
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {t(INTERVIEW_FILTER_CONFIG[filter].labelKey)}
              </button>
            ))}
          </div>
        ) : (
          /* Spacer to align cards across all columns */
          <div className="mt-2 min-h-[28px]" />
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pb-4 p-1.5 -m-1.5 rounded-lg">
        {visibleJobs.map((job) => (
          <JobCard 
            key={job.id} 
            job={job} 
            onClick={() => onJobClick(job)} 
          />
        ))}

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                {t('jobs.showLess')}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {t('jobs.showMore', { count: hiddenCount })}
              </>
            )}
          </button>
        )}
        
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
