import { useMemo } from 'react';
import { Job, Pipeline, InterviewStage, getActivePipeline } from '@/types/job';
import { EnhancedInterviewTimeline } from './EnhancedInterviewTimeline';
import { PipelineTransferMarker } from './PipelineTransferMarker';
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
          <h2 className="text-lg font-semibold">面试记录</h2>
          {activePipeline && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                activePipeline.type === 'transfer' && 'text-primary border-primary'
              )}
            >
              {activePipeline.targetRole}
              {activePipeline.type === 'transfer' && ' (Transfer)'}
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
            Transfer
          </Button>
          
          {/* Stage Editor */}
          <StageEditor stages={activeStages} onSave={onStagesChange} />
        </div>
      </div>

      {/* Timeline content */}
      <div className="space-y-4">
        {timelineItems.map((item, index) => {
          if (item.type === 'transfer-marker') {
            return (
              <PipelineTransferMarker
                key={`transfer-${item.pipeline.id}`}
                fromPipeline={item.previousPipeline}
                toPipeline={item.pipeline}
              />
            );
          }
          
          if (item.type === 'stages') {
            // For non-active pipelines, show in a collapsed/dimmed state
            const isCollapsibleHistory = !item.isActive && hasMultiplePipelines;
            
            return (
              <div
                key={`stages-${item.pipeline.id}`}
                className={cn(
                  isCollapsibleHistory && 'opacity-60 border-l-2 border-muted-foreground/20 pl-4'
                )}
              >
                {/* Pipeline section header for history */}
                {isCollapsibleHistory && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <span className="font-medium">{item.pipeline.targetRole}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.pipeline.status === 'paused' ? '已暂停' : 
                       item.pipeline.status === 'closed' ? '已结束' : ''}
                    </Badge>
                    <span className="text-xs">
                      {new Date(item.pipeline.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                
                <EnhancedInterviewTimeline
                  stages={item.pipeline.stages}
                  onStageUpdate={(stageId, updates) => {
                    if (item.isActive) {
                      onStageUpdate(stageId, updates);
                    }
                  }}
                  jobContext={jobContext}
                />
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
}
