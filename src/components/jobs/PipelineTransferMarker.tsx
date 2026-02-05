import { GitBranch, ArrowRight, Snowflake, Users, Building2 } from 'lucide-react';
import { Pipeline } from '@/types/job';
import { cn } from '@/lib/utils';

interface PipelineTransferMarkerProps {
  fromPipeline?: Pipeline;
  toPipeline: Pipeline;
  className?: string;
}

const TRANSFER_REASON_CONFIG: Record<string, { icon: React.ReactNode; label: string; labelZh: string }> = {
  hc_freeze: { icon: <Snowflake className="w-3.5 h-3.5" />, label: 'HC Freeze', labelZh: 'HC 冻结' },
  better_fit: { icon: <Users className="w-3.5 h-3.5" />, label: 'Better Fit', labelZh: '更匹配' },
  team_change: { icon: <Building2 className="w-3.5 h-3.5" />, label: 'Team Change', labelZh: '团队调整' },
  reorg: { icon: <GitBranch className="w-3.5 h-3.5" />, label: 'Reorg', labelZh: '组织调整' },
};

/**
 * Visual marker showing pipeline transfer/branch point in timeline
 */
export function PipelineTransferMarker({ fromPipeline, toPipeline, className }: PipelineTransferMarkerProps) {
  const reasonConfig = toPipeline.transferReason 
    ? TRANSFER_REASON_CONFIG[toPipeline.transferReason] 
    : null;

  return (
    <div className={cn(
      'relative flex items-center gap-3 py-4 px-4 my-2',
      'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5',
      'border-y border-dashed border-primary/30',
      className
    )}>
      {/* Branch icon */}
      <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
        <GitBranch className="w-4 h-4 text-primary" />
      </div>

      {/* Transfer info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Pipeline Transfer</span>
          {reasonConfig && (
            <span className="flex items-center gap-1 text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
              {reasonConfig.icon}
              {reasonConfig.labelZh}
            </span>
          )}
        </div>
        
        {/* From -> To */}
        <div className="flex items-center gap-2 mt-1 text-sm font-medium">
          {fromPipeline && (
            <>
              <span className="text-muted-foreground line-through">
                {fromPipeline.targetRole}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </>
          )}
          <span className="text-primary">
            {toPipeline.targetRole}
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="text-xs text-muted-foreground">
        {new Date(toPipeline.createdAt).toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        })}
      </div>
    </div>
  );
}
