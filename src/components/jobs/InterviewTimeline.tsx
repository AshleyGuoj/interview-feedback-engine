import { useState } from 'react';
import { InterviewStage, InterviewFormat } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ClipboardList,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDualTimezone } from '@/lib/timezone';

interface InterviewTimelineProps {
  stages: InterviewStage[];
  onStageUpdate: (stageId: string, updates: Partial<InterviewStage>) => void;
  onAIAction: (action: 'summarize' | 'suggest-prep' | 'extract-insights', stageId?: string) => void;
}

export function InterviewTimeline({ stages, onStageUpdate, onAIAction }: InterviewTimelineProps) {
  const [openStages, setOpenStages] = useState<string[]>([]);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<InterviewStage>>({});

  const toggleStage = (stageId: string) => {
    setOpenStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    );
  };

  const startEditing = (stage: InterviewStage) => {
    setEditingStage(stage.id);
    setEditData({
      name: stage.name,
      status: stage.status,
      date: stage.date,
      scheduledTime: stage.scheduledTime,
      scheduledTimezone: stage.scheduledTimezone || 'Asia/Shanghai',
      deadline: stage.deadline,
      deadlineTimezone: stage.deadlineTimezone || 'Asia/Shanghai',
      preparation: stage.preparation || { notes: '', stories: [], questions: [] },
      interviewLog: stage.interviewLog || { 
        interviewers: [], 
        format: 'zoom', 
        questionsAsked: [], 
        topicsCovered: [] 
      },
      postReview: stage.postReview || { 
        summary: '', 
        strengths: [], 
        risks: [], 
        signals: [], 
        nextSteps: [] 
      },
    });
  };

  const cancelEditing = () => {
    setEditingStage(null);
    setEditData({});
  };

  const saveEditing = (stageId: string) => {
    onStageUpdate(stageId, editData);
    setEditingStage(null);
    setEditData({});
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
      completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50' },
      upcoming: { label: 'Upcoming', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' },
      skipped: { label: 'Skipped', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700' },
    };
    return variants[status];
  };

  const cycleStatus = (stageId: string, currentStatus: InterviewStage['status']) => {
    const statusOrder: InterviewStage['status'][] = ['upcoming', 'completed', 'skipped'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStageUpdate(stageId, { status: nextStatus });
  };

  const updateArrayField = (
    section: 'preparation' | 'interviewLog' | 'postReview',
    field: string,
    value: string
  ) => {
    const items = value.split('\n').filter(s => s.trim());
    setEditData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: items,
      }
    }));
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {stages.map((stage) => {
          const isOpen = openStages.includes(stage.id);
          const isEditing = editingStage === stage.id;
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
                <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium">{stage.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn(statusBadge.className, 'cursor-pointer transition-colors')}
                          onClick={(e) => {
                            e.stopPropagation();
                            cycleStatus(stage.id, stage.status);
                          }}
                          title="Click to change status"
                        >
                          {statusBadge.label}
                        </Badge>
                        {stage.scheduledTime && stage.scheduledTimezone && (
                          <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            {formatDualTimezone(stage.scheduledTime, stage.scheduledTimezone)}
                          </div>
                        )}
                        {stage.deadline && stage.deadlineTimezone && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            截止: {formatDualTimezone(stage.deadline, stage.deadlineTimezone)}
                          </div>
                        )}
                        {stage.date && !stage.scheduledTime && !stage.deadline && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(stage.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={cn(
                        'w-5 h-5 text-muted-foreground transition-transform shrink-0',
                        isOpen && 'rotate-180'
                      )} />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      {/* Edit Controls */}
                      <div className="flex justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={cancelEditing}>
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveEditing(stage.id)}>
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startEditing(stage)}>
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit Stage
                          </Button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-6">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Stage Name</Label>
                              <Input
                                value={editData.name || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Status</Label>
                              <Select
                                value={editData.status}
                                onValueChange={(value) => setEditData(prev => ({ 
                                  ...prev, 
                                  status: value as InterviewStage['status'] 
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="upcoming">Upcoming</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="skipped">Skipped</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={editData.date || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                              />
                            </div>
                          </div>

                          {/* Scheduled Time with Timezone */}
                          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="w-4 h-4 text-primary" />
                              Scheduled Interview Time
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Date & Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={editData.scheduledTime || ''}
                                  onChange={(e) => setEditData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Timezone</Label>
                                <Select
                                  value={editData.scheduledTimezone || 'Asia/Shanghai'}
                                  onValueChange={(value) => setEditData(prev => ({ ...prev, scheduledTimezone: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Asia/Shanghai">北京时间 (UTC+8)</SelectItem>
                                    <SelectItem value="America/Los_Angeles">北美西部 (UTC-8)</SelectItem>
                                    <SelectItem value="America/New_York">北美东部 (UTC-5)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Deadline with Timezone */}
                          <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              Deadline (if applicable)
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Deadline Date & Time</Label>
                                <Input
                                  type="datetime-local"
                                  value={editData.deadline || ''}
                                  onChange={(e) => setEditData(prev => ({ ...prev, deadline: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Timezone</Label>
                                <Select
                                  value={editData.deadlineTimezone || 'Asia/Shanghai'}
                                  onValueChange={(value) => setEditData(prev => ({ ...prev, deadlineTimezone: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Asia/Shanghai">北京时间 (UTC+8)</SelectItem>
                                    <SelectItem value="America/Los_Angeles">北美西部 (UTC-8)</SelectItem>
                                    <SelectItem value="America/New_York">北美东部 (UTC-5)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Preparation Section */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <FileText className="w-4 h-4 text-primary" />
                              Preparation
                            </div>
                            <div className="space-y-3 pl-6">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Notes</Label>
                                <Textarea
                                  value={editData.preparation?.notes || ''}
                                  onChange={(e) => setEditData(prev => ({
                                    ...prev,
                                    preparation: { ...prev.preparation!, notes: e.target.value }
                                  }))}
                                  placeholder="Preparation notes..."
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Stories/Examples (one per line)</Label>
                                <Textarea
                                  value={editData.preparation?.stories?.join('\n') || ''}
                                  onChange={(e) => updateArrayField('preparation', 'stories', e.target.value)}
                                  placeholder="STAR stories to prepare..."
                                  rows={2}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Questions for Interviewer (one per line)</Label>
                                <Textarea
                                  value={editData.preparation?.questions?.join('\n') || ''}
                                  onChange={(e) => updateArrayField('preparation', 'questions', e.target.value)}
                                  placeholder="Questions to ask..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Interview Log Section */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <MessageSquare className="w-4 h-4 text-primary" />
                              Interview Log
                            </div>
                            <div className="space-y-3 pl-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Format</Label>
                                  <Select
                                    value={editData.interviewLog?.format || 'zoom'}
                                    onValueChange={(value) => setEditData(prev => ({
                                      ...prev,
                                      interviewLog: { ...prev.interviewLog!, format: value as InterviewFormat }
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="phone">Phone</SelectItem>
                                      <SelectItem value="zoom">Zoom/Video</SelectItem>
                                      <SelectItem value="onsite">Onsite</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Interviewers (one per line)</Label>
                                  <Textarea
                                    value={editData.interviewLog?.interviewers?.join('\n') || ''}
                                    onChange={(e) => updateArrayField('interviewLog', 'interviewers', e.target.value)}
                                    placeholder="Interviewer names..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Questions Asked (one per line)</Label>
                                <Textarea
                                  value={editData.interviewLog?.questionsAsked?.join('\n') || ''}
                                  onChange={(e) => updateArrayField('interviewLog', 'questionsAsked', e.target.value)}
                                  placeholder="Questions you were asked..."
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Topics Covered (one per line)</Label>
                                <Textarea
                                  value={editData.interviewLog?.topicsCovered?.join('\n') || ''}
                                  onChange={(e) => updateArrayField('interviewLog', 'topicsCovered', e.target.value)}
                                  placeholder="Main topics discussed..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Post-Interview Review Section */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <ClipboardList className="w-4 h-4 text-primary" />
                              Post-Interview Review
                            </div>
                            <div className="space-y-3 pl-6">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Summary</Label>
                                <Textarea
                                  value={editData.postReview?.summary || ''}
                                  onChange={(e) => setEditData(prev => ({
                                    ...prev,
                                    postReview: { ...prev.postReview!, summary: e.target.value }
                                  }))}
                                  placeholder="Overall summary of how it went..."
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Strengths (one per line)</Label>
                                  <Textarea
                                    value={editData.postReview?.strengths?.join('\n') || ''}
                                    onChange={(e) => updateArrayField('postReview', 'strengths', e.target.value)}
                                    placeholder="What went well..."
                                    rows={2}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Risks/Gaps (one per line)</Label>
                                  <Textarea
                                    value={editData.postReview?.risks?.join('\n') || ''}
                                    onChange={(e) => updateArrayField('postReview', 'risks', e.target.value)}
                                    placeholder="Areas of concern..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Signals (one per line)</Label>
                                  <Textarea
                                    value={editData.postReview?.signals?.join('\n') || ''}
                                    onChange={(e) => updateArrayField('postReview', 'signals', e.target.value)}
                                    placeholder="Positive/negative signals..."
                                    rows={2}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Next Steps (one per line)</Label>
                                  <Textarea
                                    value={editData.postReview?.nextSteps?.join('\n') || ''}
                                    onChange={(e) => updateArrayField('postReview', 'nextSteps', e.target.value)}
                                    placeholder="Action items..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
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
                            <div className="pl-6 text-sm text-muted-foreground space-y-1">
                              {stage.preparation?.notes && <p>{stage.preparation.notes}</p>}
                              {stage.preparation?.stories && stage.preparation.stories.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium">Stories: </span>
                                  {stage.preparation.stories.join(', ')}
                                </div>
                              )}
                              {stage.preparation?.questions && stage.preparation.questions.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium">Questions: </span>
                                  {stage.preparation.questions.join(', ')}
                                </div>
                              )}
                              {!stage.preparation?.notes && !stage.preparation?.stories?.length && !stage.preparation?.questions?.length && (
                                <p className="italic">No preparation notes yet...</p>
                              )}
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
                                  {stage.interviewLog.questionsAsked.length > 0 && (
                                    <div>
                                      <p className="font-medium text-foreground">Questions Asked:</p>
                                      <ul className="list-disc list-inside ml-2">
                                        {stage.interviewLog.questionsAsked.map((q, i) => (
                                          <li key={i}>{q}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {stage.interviewLog.topicsCovered.length > 0 && (
                                    <p>Topics: {stage.interviewLog.topicsCovered.join(', ')}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="italic">No interview log recorded...</p>
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
                              {stage.postReview ? (
                                <div className="space-y-2">
                                  {stage.postReview.summary && <p>{stage.postReview.summary}</p>}
                                  {stage.postReview.strengths.length > 0 && (
                                    <div>
                                      <span className="text-xs font-medium text-emerald-600">Strengths: </span>
                                      {stage.postReview.strengths.join(', ')}
                                    </div>
                                  )}
                                  {stage.postReview.risks.length > 0 && (
                                    <div>
                                      <span className="text-xs font-medium text-amber-600">Risks: </span>
                                      {stage.postReview.risks.join(', ')}
                                    </div>
                                  )}
                                  {stage.postReview.signals.length > 0 && (
                                    <div>
                                      <span className="text-xs font-medium text-blue-600">Signals: </span>
                                      {stage.postReview.signals.join(', ')}
                                    </div>
                                  )}
                                  {stage.postReview.nextSteps.length > 0 && (
                                    <div>
                                      <span className="text-xs font-medium">Next Steps: </span>
                                      {stage.postReview.nextSteps.join(', ')}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="italic">No review recorded...</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
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
