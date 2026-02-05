import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Snowflake, GitBranch, X } from 'lucide-react';
import { InterviewStage } from '@/types/job';

interface OnHoldPromptProps {
  stage: InterviewStage;
  onCreateTransfer: () => void;
  onDismiss: () => void;
}

/**
 * Auto-detected prompt when a stage is marked as on_hold (HC Freeze)
 * Suggests creating a transfer pipeline branch
 */
export function OnHoldPrompt({ stage, onCreateTransfer, onDismiss }: OnHoldPromptProps) {
  return (
    <Alert className="border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/50">
      <Snowflake className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
      <AlertTitle className="text-cyan-800 dark:text-cyan-300 flex items-center justify-between">
        <span>HC Freeze Detected</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 -mr-2" 
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm text-cyan-700 dark:text-cyan-400">
          <strong>{stage.name}</strong> is on hold. This often means a role transfer is possible.
        </p>
        <p className="text-xs text-muted-foreground">
          Create a transfer branch to track a new role while preserving your interview history.
        </p>
        <Button 
          size="sm" 
          variant="outline"
          className="gap-2 border-cyan-300 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-900"
          onClick={onCreateTransfer}
        >
          <GitBranch className="w-4 h-4" />
          Transfer to New Role
        </Button>
      </AlertDescription>
    </Alert>
  );
}
