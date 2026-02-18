import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Job, InterviewStage } from '@/types/job';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Building2,
  ChevronRight,
  FileText,
  MessageSquare,
  Lightbulb,
  Plus,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'with_records' | 'closed';

interface StageWithAnalysis {
  stage: InterviewStage;
  hasAnalysis: boolean;
  questionCount: number;
  hasReflection: boolean;
}

interface JobWithStages {
  job: Job;
  stages: StageWithAnalysis[];
  totalAnalyses: number;
}

interface AnalyticsJobTreeProps {
  jobs: Job[];
  selectedJobId: string | null;
  selectedStageId: string | null;
  onSelect: (jobId: string, stageId: string) => void;
  expandedJobs: Set<string>;
  onToggleJob: (jobId: string) => void;
}

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return true;
  const queryWords = lowerQuery.split(/\s+/);
  return queryWords.every(word => lowerText.includes(word));
}

const ACTIVE_STATUSES = new Set(['applied', 'interviewing', 'offer']);

function isJobActive(job: Job): boolean {
  return ACTIVE_STATUSES.has(job.status);
}

const FILTER_OPTIONS: { value: FilterType; labelKey: string }[] = [
  { value: 'all', labelKey: 'analytics.filterAll' },
  { value: 'active', labelKey: 'analytics.filterActive' },
  { value: 'with_records', labelKey: 'analytics.filterWithRecords' },
  { value: 'closed', labelKey: 'analytics.filterClosed' },
];

export function AnalyticsJobTree({
  jobs,
  selectedJobId,
  selectedStageId,
  onSelect,
  expandedJobs,
  onToggleJob,
}: AnalyticsJobTreeProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Group jobs with their interview stages that have content
  const jobsWithStages = useMemo((): JobWithStages[] => {
    return jobs
      .map(job => {
        const interviewStages = job.stages
          .filter(s => s.name.toLowerCase() !== 'applied')
          .map(stage => ({
            stage,
            hasAnalysis: (stage.questions?.length || 0) > 0 || !!stage.reflection,
            questionCount: stage.questions?.length || 0,
            hasReflection: !!(stage.reflection?.whatWentWell?.length || stage.reflection?.whatCouldImprove?.length),
          }));

        return {
          job,
          stages: interviewStages,
          totalAnalyses: interviewStages.filter(s => s.hasAnalysis).length,
        };
      })
      .filter(item => item.stages.length > 0);
  }, [jobs]);

  // Apply search + filter + sort (active first, then by updatedAt)
  const filteredJobs = useMemo(() => {
    let result = jobsWithStages;

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(({ job }) => {
        const searchText = `${job.companyName} ${job.roleTitle}`;
        return fuzzyMatch(searchText, searchQuery);
      });
    }

    // Category filter
    if (activeFilter === 'active') {
      result = result.filter(({ job }) => isJobActive(job));
    } else if (activeFilter === 'closed') {
      result = result.filter(({ job }) => !isJobActive(job));
    } else if (activeFilter === 'with_records') {
      result = result.filter(({ totalAnalyses }) => totalAnalyses > 0);
    }

    // Sort: active first, then by updatedAt desc
    return result.sort((a, b) => {
      const aActive = isJobActive(a.job);
      const bActive = isJobActive(b.job);
      if (aActive !== bActive) return aActive ? -1 : 1;
      return new Date(b.job.updatedAt).getTime() - new Date(a.job.updatedAt).getTime();
    });
  }, [jobsWithStages, searchQuery, activeFilter]);

  // Split into active and closed groups for rendering the divider
  const activeJobs = filteredJobs.filter(({ job }) => isJobActive(job));
  const closedJobs = filteredJobs.filter(({ job }) => !isJobActive(job));

  if (jobsWithStages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
        <FileText className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">{t('analytics.noInterviewRecords')}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t('analytics.addJobOnBoard')}
        </p>
      </div>
    );
  }

  const renderJobItem = ({ job, stages, totalAnalyses }: JobWithStages) => {
    const isExpanded = expandedJobs.has(job.id);
    const isJobSelected = selectedJobId === job.id;
    const isClosed = !isJobActive(job);

    return (
      <Collapsible
        key={job.id}
        open={isExpanded}
        onOpenChange={() => onToggleJob(job.id)}
      >
        <CollapsibleTrigger className="w-full">
          <div
            className={cn(
              'flex items-center gap-2 p-2.5 rounded-lg text-left w-full transition-colors hover:bg-muted',
              isJobSelected && !selectedStageId && 'bg-primary/10',
              isClosed && 'opacity-60'
            )}
          >
            <ChevronRight
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform shrink-0',
                isExpanded && 'rotate-90'
              )}
            />
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{job.companyName}</p>
              <p className="text-xs text-muted-foreground truncate">{job.roleTitle}</p>
            </div>
            {totalAnalyses > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5 shrink-0">
                {totalAnalyses}
              </Badge>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="ml-6 pl-2 border-l space-y-0.5 py-1">
            {stages.map(({ stage, hasAnalysis, questionCount, hasReflection }) => {
              const isSelected = selectedJobId === job.id && selectedStageId === stage.id;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    'flex items-center gap-2 p-2 pl-3 rounded-md cursor-pointer transition-colors hover:bg-muted relative',
                    isSelected && 'bg-primary/15 text-primary font-medium before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-primary before:rounded-full'
                  )}
                  onClick={() => onSelect(job.id, stage.id)}
                >
                  {hasAnalysis ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm flex-1 truncate">{stage.name}</span>
                  <div className="flex items-center gap-1.5">
                    {questionCount > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-primary">
                        <MessageSquare className="w-3 h-3" />
                        {questionCount}
                      </span>
                    )}
                    {hasReflection && (
                      <Lightbulb className="w-3 h-3 text-primary/70" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Input */}
      <div className="p-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('analytics.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-3 py-2 border-b shrink-0">
        <div className="flex gap-1 rounded-lg bg-muted/50 p-0.5">
          {FILTER_OPTIONS.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={cn(
                'flex-1 text-xs py-1.5 px-2 rounded-md transition-colors font-medium',
                activeFilter === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredJobs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">{t('common.noMatchFound')}</p>
            </div>
          ) : (
            <>
              {activeJobs.map(renderJobItem)}
              {closedJobs.length > 0 && activeJobs.length > 0 && activeFilter === 'all' && (
                <div className="flex items-center gap-2 py-2 px-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    {t('analytics.filterClosed')}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              {closedJobs.map(renderJobItem)}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
