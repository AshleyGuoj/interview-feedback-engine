import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Job, Pipeline, InterviewStage, getActivePipeline } from '@/types/job';
import { EnhancedInterviewTimeline } from './EnhancedInterviewTimeline';
import { CollapsiblePipelineHistory } from './CollapsiblePipelineHistory';
import { PipelineSelector } from './PipelineSelector';
import { StageEditor } from './StageEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedInterviewTimelineProps {
  job: Job;
  onStageUpdate: (stageId: string, updates: Partial<InterviewStage>) => void;
  onStagesChange: (stages: InterviewStage[]) => void;
  onOpenTransfer: () => void;
  onOpenCustomize?: () => void;
  activePipelineId?: string | null;
  onSelectPipeline?: (pipelineId: string) => void;
  jobContext?: {
    jobId?: string;
    company?: string;
    role?: string;
  };
}

interface TimelineItem {
  type: 'pipeline-header' | 'transfer-marker' | 'stages';
  pipeline: Pipeline;
  previousPipeline?: Pipeline;
  isActive: boolean;
}

/**
 * Unified Interview Timeline that shows:
 * 1. All pipeline histories in chronological order
 * 2. Transfer markers between pipelines
 * 3. Collapsible sections for non-active pipelines
 */
export function UnifiedInterviewTimeline({
  job,
  onStageUpdate,
  onStagesChange,
  onOpenTransfer,
  onOpenCustomize,
  activePipelineId,
  onSelectPipeline,
  jobContext,
}: UnifiedInterviewTimelineProps) {
  const { t } = useTranslation();
  
  const activePipeline = useMemo(() => {
    if (activePipelineId && job.pipelines?.length > 0) {
      return job.pipelines.find(p => p.id === activePipelineId) || getActivePipeline(job);
    }
    return getActivePipeline(job);
  }, [job, activePipelineId]);

  // Build timeline items in chronological order
  const timelineItems = useMemo((): TimelineItem[] => {
    if (!job.pipelines || job.pipelines.length === 0) {
      // Legacy single-pipeline mode
      return [{
        type: 'stages',
        pipeline: {
          id: 'legacy',
          type: 'primary',
          status: 'active',
          targetRole: job.roleTitle,
          stages: job.stages || [],
          createdAt: job.createdAt,
        },
        isActive: true,
      }];
    }

    // Sort pipelines by createdAt (oldest first for chronological display)
    const sortedPipelines = [...job.pipelines].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const items: TimelineItem[] = [];
    
    sortedPipelines.forEach((pipeline, index) => {
      const isActive = pipeline.id === activePipeline?.id;
      const previousPipeline = index > 0 ? sortedPipelines[index - 1] : undefined;
      
      // Add transfer marker if this is a transfer pipeline
      if (pipeline.originPipelineId || (index > 0 && pipeline.type !== 'primary')) {
        items.push({
          type: 'transfer-marker',
          pipeline,
          previousPipeline,
          isActive,
        });
      }
      
      // Add the stages for this pipeline
      items.push({
        type: 'stages',
        pipeline,
        previousPipeline,
        isActive,
      });
    });

    return items;
  }, [job, activePipeline]);

  const hasMultiplePipelines = job.pipelines && job.pipelines.length > 1;

  // Get the active pipeline's stages for the stage editor
  const activeStages = activePipeline?.stages || job.stages || [];

  return (
    <div className="space-y-4">
      {/* Header with pipeline selector and actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t('jobs.interviewRecord')}</h2>
          {activePipeline && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                activePipeline.type === 'transfer' && 'text-primary border-primary'
              )}
            >
              {activePipeline.targetRole}
              {activePipeline.type === 'transfer' && ` (${t('jobs.transfer')})`}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Pipeline selector - only show if multiple pipelines */}
          {hasMultiplePipelines && onSelectPipeline && (
            <PipelineSelector
              pipelines={job.pipelines}
              activePipelineId={activePipeline?.id || null}
              onSelectPipeline={onSelectPipeline}
              onCreateBranch={onOpenTransfer}
              companyName={job.companyName}
            />
          )}
          
          {/* Transfer button - always visible */}
          <Button variant="outline" size="sm" onClick={onOpenTransfer}>
            <GitBranch className="w-4 h-4 mr-1.5" />
            {t('jobs.transfer')}
          </Button>
          
          {/* Stage Editor */}
          <StageEditor stages={activeStages} onSave={onStagesChange} />
        </div>
      </div>

      {/* Timeline content - Active pipeline first, then history */}
      <div className="space-y-6">
        {/* Active Pipeline - Full display */}
        {timelineItems
          .filter(item => item.type === 'stages' && item.isActive)
          .map(item => (
            <div key={`stages-${item.pipeline.id}`}>
              <EnhancedInterviewTimeline
                stages={item.pipeline.stages}
                onStageUpdate={onStageUpdate}
                jobContext={jobContext}
              />
            </div>
          ))
        }

        {/* Historical Pipelines - Collapsible, only meaningful stages */}
        {timelineItems
          .filter(item => item.type === 'stages' && !item.isActive && hasMultiplePipelines)
          .map(item => (
            <CollapsiblePipelineHistory
              key={`history-${item.pipeline.id}`}
              pipeline={item.pipeline}
              previousPipeline={item.previousPipeline}
              jobContext={jobContext}
            />
          ))
        }
      </div>
    </div>
  );
}
