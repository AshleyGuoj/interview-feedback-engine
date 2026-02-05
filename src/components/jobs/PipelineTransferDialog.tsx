import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Snowflake, Users, Building2, ArrowRight } from 'lucide-react';
import { Pipeline, DEFAULT_STAGES } from '@/types/job';
import { cn } from '@/lib/utils';

interface PipelineTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPipeline: Pipeline | null;
  companyName: string;
  onCreateBranch: (newPipeline: Omit<Pipeline, 'id' | 'createdAt'>) => void;
}

type TransferReason = 'hc_freeze' | 'better_fit' | 'team_change' | 'reorg';

const TRANSFER_REASONS: { value: TransferReason; label: string; labelZh: string; icon: React.ReactNode }[] = [
  { value: 'hc_freeze', label: 'HC Freeze', labelZh: 'HC 冻结', icon: <Snowflake className="w-4 h-4" /> },
  { value: 'better_fit', label: 'Better Fit', labelZh: '更匹配其他岗位', icon: <Users className="w-4 h-4" /> },
  { value: 'team_change', label: 'Team Change', labelZh: '团队调整', icon: <Building2 className="w-4 h-4" /> },
  { value: 'reorg', label: 'Reorg', labelZh: '组织架构调整', icon: <GitBranch className="w-4 h-4" /> },
];

export function PipelineTransferDialog({
  open,
  onOpenChange,
  currentPipeline,
  companyName,
  onCreateBranch,
}: PipelineTransferDialogProps) {
  const [newRole, setNewRole] = useState('');
  const [reason, setReason] = useState<TransferReason>('hc_freeze');

  const handleCreate = () => {
    if (!newRole.trim()) return;

    const newStages = DEFAULT_STAGES.map((stage, index) => ({
      ...stage,
      id: `stage-${Date.now()}-${index}`,
    }));

    onCreateBranch({
      type: 'transfer',
      status: 'active',
      targetRole: newRole.trim(),
      originPipelineId: currentPipeline?.id,
      transferReason: reason,
      stages: newStages,
    });

    setNewRole('');
    setReason('hc_freeze');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Transfer Pipeline</DialogTitle>
              <DialogDescription className="mt-1">
                Create a new pipeline branch for {companyName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current pipeline info */}
          {currentPipeline && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground mb-1">From Pipeline</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentPipeline.type === 'primary' ? 'Primary' : 'Transfer'}
                </Badge>
                <span className="font-medium">{currentPipeline.targetRole}</span>
              </div>
            </div>
          )}

          {/* Transfer reason */}
          <div className="space-y-2">
            <Label>Reason for Transfer</Label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSFER_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                    reason === r.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className={cn(
                    'p-1.5 rounded-md',
                    reason === r.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {r.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.labelZh}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* New role */}
          <div className="space-y-2">
            <Label htmlFor="newRole">New Role Title *</Label>
            <Input
              id="newRole"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="e.g., Growth PM, Senior Engineer"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              The role you're being transferred to at {companyName}
            </p>
          </div>

          {/* Visual representation */}
          <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-muted/50 via-transparent to-muted/50">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Original</div>
              <Badge variant="outline" className="text-xs">
                {currentPipeline?.targetRole || 'Primary'}
              </Badge>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">New</div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                {newRole || '...'}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!newRole.trim()}>
            <GitBranch className="w-4 h-4 mr-2" />
            Create Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
