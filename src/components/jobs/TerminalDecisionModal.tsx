import { useState } from 'react';
import { InterviewStage, Pipeline, StageResult } from '@/types/job';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { XCircle, Snowflake, GitBranch, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalDecisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: InterviewStage;
  result: StageResult;
  currentPipeline: Pipeline | null;
  companyName: string;
  onClosePipeline: () => void;
  onTransfer: (newRole: string) => void;
}

const RESULT_CONFIG: Record<NonNullable<StageResult>, { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}> = {
  rejected: {
    icon: <XCircle className="w-6 h-6" />,
    title: 'This pipeline has reached an endpoint',
    description: 'You marked this stage as not passed.',
    color: 'text-red-500',
  },
  on_hold: {
    icon: <Snowflake className="w-6 h-6" />,
    title: 'Pipeline paused due to hiring freeze',
    description: 'The position has been put on hold.',
    color: 'text-cyan-500',
  },
  passed: {
    icon: null,
    title: '',
    description: '',
    color: '',
  },
  mixed_feedback: {
    icon: null,
    title: '',
    description: '',
    color: '',
  },
};

export function TerminalDecisionModal({
  open,
  onOpenChange,
  stage,
  result,
  currentPipeline,
  companyName,
  onClosePipeline,
  onTransfer,
}: TerminalDecisionModalProps) {
  const [showRoleInput, setShowRoleInput] = useState(false);
  const [newRole, setNewRole] = useState('');

  if (!result || !['rejected', 'on_hold'].includes(result)) {
    return null;
  }

  const config = RESULT_CONFIG[result];

  const handleClose = () => {
    onClosePipeline();
    onOpenChange(false);
    setShowRoleInput(false);
    setNewRole('');
  };

  const handleTransferClick = () => {
    setShowRoleInput(true);
  };

  const handleTransferConfirm = () => {
    if (newRole.trim()) {
      onTransfer(newRole.trim());
      onOpenChange(false);
      setShowRoleInput(false);
      setNewRole('');
    }
  };

  const handleCancel = () => {
    if (showRoleInput) {
      setShowRoleInput(false);
      setNewRole('');
    } else {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[440px]">
        <AlertDialogHeader>
          <div className={cn('flex items-center gap-3', config.color)}>
            {config.icon}
            <AlertDialogTitle className="text-lg">
              {config.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 space-y-3">
            <p>
              You marked <strong>{stage.name}</strong> as{' '}
              <Badge 
                variant="outline" 
                className={cn(
                  'font-medium',
                  result === 'rejected' && 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400',
                  result === 'on_hold' && 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400'
                )}
              >
                {result === 'rejected' ? 'Not Passed' : 'Hiring Freeze'}
              </Badge>
            </p>
            <p className="text-muted-foreground">
              What would you like to do next?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {showRoleInput ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role Title</Label>
              <Input
                id="new-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder={`e.g., ${currentPipeline?.targetRole || 'Product Manager'} (另一个团队)`}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleTransferConfirm()}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GitBranch className="w-3.5 h-3.5" />
              <span>
                A new pipeline will be created for {companyName}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {/* Option 1: Close Pipeline */}
            <button
              onClick={handleClose}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                result === 'rejected' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400'
              )}>
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Close this pipeline</p>
                <p className="text-sm text-muted-foreground">
                  End the process for {currentPipeline?.targetRole || 'this role'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Option 2: Transfer */}
            <button
              onClick={handleTransferClick}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">Transfer to another role</p>
                <p className="text-sm text-muted-foreground">
                  Continue at {companyName} in a different position
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        <AlertDialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            {showRoleInput ? 'Back' : 'Cancel'}
          </Button>
          {showRoleInput && (
            <Button onClick={handleTransferConfirm} disabled={!newRole.trim()}>
              <GitBranch className="w-4 h-4 mr-2" />
              Create Transfer Pipeline
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
