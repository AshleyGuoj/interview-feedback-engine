import { useState, useMemo } from 'react';
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

// Simple fuzzy match function
function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return true;
  
  // Split query into words for multi-word matching
  const queryWords = lowerQuery.split(/\s+/);
  
  return queryWords.every(word => lowerText.includes(word));
}

export function AnalyticsJobTree({
  jobs,
  selectedJobId,
  selectedStageId,
  onSelect,
  expandedJobs,
  onToggleJob,
}: AnalyticsJobTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
      .filter(item => item.stages.length > 0)
      .sort((a, b) => new Date(b.job.updatedAt).getTime() - new Date(a.job.updatedAt).getTime());
  }, [jobs]);

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobsWithStages;
    
    return jobsWithStages.filter(({ job }) => {
      const searchText = `${job.companyName} ${job.roleTitle}`;
      return fuzzyMatch(searchText, searchQuery);
    });
  }, [jobsWithStages, searchQuery]);

  if (jobsWithStages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
        <FileText className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm text-muted-foreground">暂无面试记录</p>
        <p className="text-xs text-muted-foreground mt-1">
          在 Job Board 添加职位并记录面试
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Input - Always visible */}
      <div className="p-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索职位..."
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

      {/* Job List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredJobs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">未找到匹配的职位</p>
            </div>
          ) : (
            filteredJobs.map(({ job, stages, totalAnalyses }) => {
              const isExpanded = expandedJobs.has(job.id);
              const isJobSelected = selectedJobId === job.id;

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
                        isJobSelected && !selectedStageId && 'bg-primary/10'
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
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
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
                                <Lightbulb className="w-3 h-3 text-amber-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
