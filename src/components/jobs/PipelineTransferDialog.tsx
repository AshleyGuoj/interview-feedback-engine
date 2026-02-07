import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function PipelineTransferDialog({
  open,
  onOpenChange,
  currentPipeline,
  companyName,
  onCreateBranch,
}: PipelineTransferDialogProps) {
  const { t } = useTranslation();
  const [newRole, setNewRole] = useState('');
  const [reason, setReason] = useState<TransferReason>('hc_freeze');

  const TRANSFER_REASONS: { value: TransferReason; labelKey: string; icon: React.ReactNode }[] = [
    { value: 'hc_freeze', labelKey: 'jobs.hcFreeze', icon: <Snowflake className="w-4 h-4" /> },
    { value: 'better_fit', labelKey: 'jobs.betterFit', icon: <Users className="w-4 h-4" /> },
    { value: 'team_change', labelKey: 'jobs.teamChange', icon: <Building2 className="w-4 h-4" /> },
    { value: 'reorg', labelKey: 'jobs.reorg', icon: <GitBranch className="w-4 h-4" /> },
  ];

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
              <DialogTitle>{t('jobs.transferPipeline')}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('jobs.createBranchFor', { company: companyName })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current pipeline info */}
          {currentPipeline && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground mb-1">{t('jobs.fromPipeline')}</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentPipeline.type === 'primary' ? t('jobs.primary') : t('jobs.transfer')}
                </Badge>
                <span className="font-medium">{currentPipeline.targetRole}</span>
              </div>
            </div>
          )}

          {/* Transfer reason */}
          <div className="space-y-2">
            <Label>{t('jobs.reasonForTransfer')}</Label>
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
                  <div className="text-sm font-medium">{t(r.labelKey)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* New role */}
          <div className="space-y-2">
            <Label htmlFor="newRole">{t('jobs.newRoleTitle')} *</Label>
            <Input
              id="newRole"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder={t('jobs.newRolePlaceholder')}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {t('jobs.newRoleHint', { company: companyName })}
            </p>
          </div>

          {/* Visual representation */}
          <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-muted/50 via-transparent to-muted/50">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('jobs.original')}</div>
              <Badge variant="outline" className="text-xs">
                {currentPipeline?.targetRole || t('jobs.primary')}
              </Badge>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{t('common.next')}</div>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                {newRole || '...'}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCreate} disabled={!newRole.trim()}>
            <GitBranch className="w-4 h-4 mr-2" />
            {t('jobs.createBranch')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
