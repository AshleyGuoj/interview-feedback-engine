import { useState } from 'react';
import { InterviewStage } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  Check, 
  Circle, 
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterviewTimelineProps {
  stages: InterviewStage[];
  onStageUpdate: (stageId: string, updates: Partial<InterviewStage>) => void;
  onAIAction: (action: 'summarize' | 'suggest-prep' | 'extract-insights', stageId?: string) => void;
}

export function InterviewTimeline({ stages, onStageUpdate, onAIAction }: InterviewTimelineProps) {
  const [openStages, setOpenStages] = useState<string[]>([]);

  const toggleStage = (stageId: string) => {
    setOpenStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const getStatusIcon = (status: InterviewStage['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'skipped':
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: InterviewStage['status']) => {
    const variants: Record<InterviewStage['status'], { label: string; className: string }> = {
      completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
      upcoming: { label: 'Upcoming', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      skipped: { label: 'Skipped', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    };
    return variants[status];
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isOpen = openStages.includes(stage.id);
          const statusBadge = getStatusBadge(stage.status);

          return (
            <div key={stage.id} className="relative pl-12">
              {/* Timeline dot */}
              <div className={cn(
                'absolute left-2 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background',
                stage.status === 'completed' ? 'border-emerald-500' : 
                stage.status === 'upcoming' ? 'border-amber-500' : 'border-muted'
              )}>
                {getStatusIcon(stage.status)}
              </div>

              <Collapsible open={isOpen} onOpenChange={() => toggleStage(stage.id)}>
                <Card className={cn(
                  'transition-all',
                  isOpen && 'ring-1 ring-primary/20'
                )}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{stage.name}</span>
                        <Badge variant="secondary" className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                        {stage.date && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(stage.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform',
                        isOpen && 'rotate-180'
                      )} />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      {/* Preparation Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="w-4 h-4 text-primary" />
                            Preparation
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
                            onClick={() => onAIAction('suggest-prep', stage.id)}
                          >
                            <Sparkles className="w-3 h-3" />
                            Suggest prep
                          </Button>
                        </div>
                        <div className="pl-6 text-sm text-muted-foreground">
                          {stage.preparation?.notes || 'No preparation notes yet...'}
                        </div>
                      </div>

                      {/* Interview Log Section */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Interview Log
                        </div>
                        <div className="pl-6 text-sm text-muted-foreground">
                          {stage.interviewLog ? (
                            <div className="space-y-1">
                              <p>Format: {stage.interviewLog.format}</p>
                              {stage.interviewLog.interviewers.length > 0 && (
                                <p>Interviewers: {stage.interviewLog.interviewers.join(', ')}</p>
                              )}
                            </div>
                          ) : (
                            'No interview log recorded...'
                          )}
                        </div>
                      </div>

                      {/* Post-Interview Review Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <ClipboardList className="w-4 h-4 text-primary" />
                            Post-Interview Review
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1.5 text-primary hover:text-primary"
                            onClick={() => onAIAction('summarize', stage.id)}
                          >
                            <Sparkles className="w-3 h-3" />
                            Summarize
                          </Button>
                        </div>
                        <div className="pl-6 text-sm text-muted-foreground">
                          {stage.postReview?.summary || 'No review recorded...'}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}
