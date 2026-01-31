import { useState } from 'react';
import { 
  InterviewPipeline, 
  PipelineStage,
  DEFAULT_STAGE_CONFIGS,
  StageCategory
} from '@/types/interview-pipeline';
import { PipelineStageCard } from './PipelineStageCard';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Plus, Settings, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

interface PipelineTimelineProps {
  pipeline: InterviewPipeline;
  onStageUpdate: (stageId: string, updates: Partial<PipelineStage>) => void;
  onAddStage: (category: StageCategory, name: string) => void;
  onReorderStages: (stages: PipelineStage[]) => void;
}

export function PipelineTimeline({ 
  pipeline, 
  onStageUpdate, 
  onAddStage,
  onReorderStages 
}: PipelineTimelineProps) {
  const [isReorderMode, setIsReorderMode] = useState(false);

  const handleAddStage = (category: StageCategory) => {
    const config = DEFAULT_STAGE_CONFIGS.find(c => c.category === category);
    if (config) {
      const stageName = config.allowMultiple 
        ? `${config.label} ${pipeline.stages.filter(s => s.category === category).length + 1}`
        : config.label;
      onAddStage(category, stageName);
      toast.success(`已添加: ${config.labelZh}`);
    }
  };

  const handleMoveUp = (stageId: string) => {
    const idx = pipeline.stages.findIndex(s => s.id === stageId);
    if (idx > 0) {
      const newStages = [...pipeline.stages];
      [newStages[idx], newStages[idx - 1]] = [newStages[idx - 1], newStages[idx]];
      newStages.forEach((s, i) => s.order = i + 1);
      onReorderStages(newStages);
    }
  };

  const handleMoveDown = (stageId: string) => {
    const idx = pipeline.stages.findIndex(s => s.id === stageId);
    if (idx < pipeline.stages.length - 1) {
      const newStages = [...pipeline.stages];
      [newStages[idx], newStages[idx + 1]] = [newStages[idx + 1], newStages[idx]];
      newStages.forEach((s, i) => s.order = i + 1);
      onReorderStages(newStages);
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          面试流程
          <span className="text-sm font-normal text-muted-foreground">
            ({pipeline.stages.length} 阶段)
          </span>
        </h3>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsReorderMode(!isReorderMode)}
            className={isReorderMode ? 'bg-primary/10' : ''}
          >
            <ArrowUpDown className="w-4 h-4 mr-1" />
            {isReorderMode ? '完成排序' : '调整顺序'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                添加阶段
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>选择阶段类型</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DEFAULT_STAGE_CONFIGS.filter(c => c.allowMultiple || !pipeline.stages.some(s => s.category === c.category)).map(config => (
                <DropdownMenuItem 
                  key={config.category}
                  onClick={() => handleAddStage(config.category)}
                >
                  <span>{config.labelZh}</span>
                  {config.allowMultiple && (
                    <span className="ml-auto text-xs text-muted-foreground">(可重复)</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {pipeline.stages
          .sort((a, b) => a.order - b.order)
          .map((stage, index) => (
            <div key={stage.id} className="relative">
              {isReorderMode && (
                <div className="absolute -left-8 top-4 flex flex-col gap-1 z-10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleMoveUp(stage.id)}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleMoveDown(stage.id)}
                    disabled={index === pipeline.stages.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              )}
              <PipelineStageCard
                stage={stage}
                isLast={index === pipeline.stages.length - 1}
                onUpdate={onStageUpdate}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
