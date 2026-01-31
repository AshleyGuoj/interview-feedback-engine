import { useState, useCallback } from 'react';
import { 
  InterviewPipeline, 
  PipelineStage, 
  StageCategory,
  DEFAULT_STAGE_CONFIGS
} from '@/types/interview-pipeline';
import { PipelineHeader } from './PipelineHeader';
import { PipelineTimeline } from './PipelineTimeline';
import { createMockPipeline } from '@/lib/mock-pipeline-data';
import { toast } from 'sonner';

interface InterviewPipelineDashboardProps {
  initialPipeline?: InterviewPipeline;
}

export function InterviewPipelineDashboard({ initialPipeline }: InterviewPipelineDashboardProps) {
  const [pipeline, setPipeline] = useState<InterviewPipeline>(() => 
    initialPipeline || createMockPipeline()
  );

  const handleStageUpdate = useCallback((stageId: string, updates: Partial<PipelineStage>) => {
    setPipeline(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.id === stageId 
          ? { ...stage, ...updates, updatedAt: new Date().toISOString() }
          : stage
      ),
      lastActivityAt: new Date().toISOString(),
    }));
    toast.success('阶段已更新');
  }, []);

  const handleAddStage = useCallback((category: StageCategory, name: string) => {
    const config = DEFAULT_STAGE_CONFIGS.find(c => c.category === category);
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      name,
      nameZh: config?.labelZh,
      status: 'upcoming',
      order: pipeline.stages.length + 1,
      isConfigurable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPipeline(prev => ({
      ...prev,
      stages: [...prev.stages, newStage],
      lastActivityAt: new Date().toISOString(),
    }));
  }, [pipeline.stages.length]);

  const handleReorderStages = useCallback((newStages: PipelineStage[]) => {
    setPipeline(prev => ({
      ...prev,
      stages: newStages,
      lastActivityAt: new Date().toISOString(),
    }));
    toast.success('阶段顺序已更新');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with position & candidate info */}
      <PipelineHeader pipeline={pipeline} />

      {/* Timeline */}
      <PipelineTimeline 
        pipeline={pipeline}
        onStageUpdate={handleStageUpdate}
        onAddStage={handleAddStage}
        onReorderStages={handleReorderStages}
      />
    </div>
  );
}
