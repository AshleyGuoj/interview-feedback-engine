import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, GitBranch } from 'lucide-react';
import { Pipeline, InterviewStage } from '@/types/job';
import { EnhancedInterviewTimeline } from './EnhancedInterviewTimeline';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  getDisplayStages, 
  getTerminalReasonLabel, 
  getPipelineSummary 
} from '@/lib/pipeline-utils';

interface CollapsiblePipelineHistoryProps {
  pipeline: Pipeline;
  previousPipeline?: Pipeline;
  jobContext?: {
    jobId?: string;
    company?: string;
    role?: string;
  };
  defaultExpanded?: boolean;
}

/**
 * Collapsible section for historical (inactive) pipeline
 * Shows only meaningful stages, collapses by default
 */
export function CollapsiblePipelineHistory({
  pipeline,
  previousPipeline,
  jobContext,
  defaultExpanded = true,
}: CollapsiblePipelineHistoryProps) {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // Get only meaningful stages for display
  const displayStages = getDisplayStages(pipeline, false);
  const summary = getPipelineSummary(pipeline);
  const terminalReason = getTerminalReasonLabel(pipeline);
  
  // Count meaningful stages for the preservation hint
  const preservedCount = displayStages.length;
  
  // Don't render if no meaningful stages
  if (displayStages.length === 0) {
    return null;
  }

  // Format date based on language
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const lastStageName = pipeline.stages[displayStages.length - 1]?.name || '';

  return (
    <div className="relative">
      {/* Transfer marker / visual stop */}
      <div className="flex items-center gap-3 py-3">
        <Separator className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <GitBranch className="w-3.5 h-3.5 text-primary/60" />
          <span>{terminalReason}</span>
        </div>
        <Separator className="flex-1" />
      </div>

      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 py-2.5 px-3 rounded-lg',
          'bg-muted/30 hover:bg-muted/50 transition-colors',
          'text-left group'
        )}
      >
        {/* Expand/collapse icon */}
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        
        {/* Pipeline info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {pipeline.targetRole}
            </span>
            <Badge 
              variant="secondary" 
              className="text-xs bg-muted-foreground/10"
            >
              {t('jobs.historyRecord')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {t('jobs.historyEndedAt', { summary, stage: lastStageName })}
          </p>
        </div>
        
        {/* Date */}
        <span className="text-xs text-muted-foreground/60">
          {formatDate(pipeline.createdAt)}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 pl-4 border-l-2 border-muted-foreground/20 opacity-60">
          <EnhancedInterviewTimeline
            stages={displayStages}
            onStageUpdate={() => {}} // Read-only for history
            jobContext={jobContext}
          />
        </div>
      )}
    </div>
  );
}
