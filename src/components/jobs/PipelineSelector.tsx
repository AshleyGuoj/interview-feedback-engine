import { Pipeline } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GitBranch, ChevronDown, Check, Snowflake, Users, Building2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineSelectorProps {
  pipelines: Pipeline[];
  activePipelineId: string | null;
  onSelectPipeline: (pipelineId: string) => void;
  onCreateBranch: () => void;
  companyName: string;
}

const TRANSFER_REASON_ICONS: Record<string, React.ReactNode> = {
  hc_freeze: <Snowflake className="w-3 h-3" />,
  better_fit: <Users className="w-3 h-3" />,
  team_change: <Building2 className="w-3 h-3" />,
  reorg: <GitBranch className="w-3 h-3" />,
};

export function PipelineSelector({
  pipelines,
  activePipelineId,
  onSelectPipeline,
  onCreateBranch,
  companyName,
}: PipelineSelectorProps) {
  const activePipeline = pipelines.find(p => p.id === activePipelineId);
  
  if (pipelines.length <= 1 && !activePipeline) {
    return null;
  }

  // Sort: active first, then by created date desc
  const sortedPipelines = [...pipelines].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (b.status === 'active' && a.status !== 'active') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GitBranch className="w-4 h-4" />
          <span className="max-w-[150px] truncate">
            {activePipeline?.targetRole || 'Select Pipeline'}
          </span>
          {pipelines.length > 1 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1.5">
              {pipelines.length}
            </Badge>
          )}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel className="flex items-center gap-2">
          <span>{companyName}</span>
          <span className="text-xs text-muted-foreground font-normal">Pipelines</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {sortedPipelines.map((pipeline) => (
          <DropdownMenuItem
            key={pipeline.id}
            onClick={() => onSelectPipeline(pipeline.id)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              pipeline.id === activePipelineId && 'bg-primary/5'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {pipeline.transferReason && TRANSFER_REASON_ICONS[pipeline.transferReason]}
              <div className="min-w-0">
                <div className="font-medium truncate">{pipeline.targetRole}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {pipeline.type === 'primary' ? 'Primary' : 'Transfer'}
                  {pipeline.status === 'paused' && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">
                      Paused
                    </Badge>
                  )}
                  {pipeline.status === 'closed' && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1 text-red-500 border-red-200">
                      Closed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {pipeline.id === activePipelineId && (
              <Check className="w-4 h-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateBranch} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          <span>Create Transfer Branch</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
