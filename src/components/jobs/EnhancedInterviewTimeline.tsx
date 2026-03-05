import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InterviewStage, InterviewFormat, InterviewQuestion, InterviewReflection, StageStatus, StageResult, StageCategory, STAGE_STATUS_CONFIG, STAGE_RESULT_CONFIG, STAGE_CATEGORY_CONFIG, detectStageCategory } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusIcon } from '@/components/ui/status-icon';
import { 
  ChevronDown, 
  Check, 
  Circle, 
  Clock,
  Sparkles,
  FileText,
  MessageSquare,
  Pencil,
  Save,
  X,
  Calendar,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDualTimezone } from '@/lib/timezone';
import { QuestionRecorder } from '@/components/interview/QuestionRecorder';
import { ReflectionEditor } from '@/components/interview/ReflectionEditor';

const statusColorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

interface JobContext {
  jobId?: string;
  company?: string;
  role?: string;
}

interface EnhancedInterviewTimelineProps {
  stages: InterviewStage[];
  onStageUpdate: (stageId: string, updates: Partial<InterviewStage>) => void;
  onAIAction?: (action: 'summarize' | 'suggest-prep' | 'extract-insights', stageId?: string) => void;
  jobContext?: JobContext;
}

export function EnhancedInterviewTimeline({ stages, onStageUpdate, onAIAction, jobContext }: EnhancedInterviewTimelineProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openStages, setOpenStages] = useState<string[]>([]);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<InterviewStage>>({});
  const [activeTab, setActiveTab] = useState<Record<string, string>>({});

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
      category: stage.category || detectStageCategory(stage.name),
      status: stage.status,
      result: stage.result,
      scheduledTime: stage.scheduledTime,
      scheduledTimezone: stage.scheduledTimezone || 'Asia/Shanghai',
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

  const getStatusIcon = (status: StageStatus) => {
    const positiveStatuses: StageStatus[] = ['completed'];
    const pendingStatuses: StageStatus[] = ['pending', 'scheduled', 'rescheduled', 'feedback_pending'];
    
    if (positiveStatuses.includes(status)) {
      return <Check className="w-4 h-4 text-emerald-500" />;
    } else if (pendingStatuses.includes(status)) {
      return <Clock className="w-4 h-4 text-amber-500" />;
    }
    return <Circle className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: StageStatus) => {
    const config = STAGE_STATUS_CONFIG[status];
    if (!config) return { label: status, icon: 'circle-dashed', color: 'gray', className: statusColorClasses.gray };
    
    // Get localized label
    const statusKey = `jobs.stageStatus${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}` as const;
    const label = t(statusKey, config.label);
    
    return {
      label,
      icon: config.icon,
      color: config.color,
      className: statusColorClasses[config.color] || statusColorClasses.gray
    };
  };

  const getResultLabel = (result: StageResult) => {
    if (!result) return '';
    const resultKeyMap: Record<NonNullable<StageResult>, string> = {
      passed: 'jobs.resultPassed',
      rejected: 'jobs.resultRejected',
      on_hold: 'jobs.resultOnHold',
      mixed_feedback: 'jobs.resultMixed',
    };
    return t(resultKeyMap[result]);
  };

  const handleQuestionsChange = (stageId: string, questions: InterviewQuestion[]) => {
    onStageUpdate(stageId, { questions });
  };

  const handleReflectionChange = (stageId: string, reflection: InterviewReflection) => {
    onStageUpdate(stageId, { reflection });
  };

  const getStageTab = (stageId: string) => activeTab[stageId] || 'questions';
  const setStageTab = (stageId: string, tab: string) => {
    setActiveTab(prev => ({ ...prev, [stageId]: tab }));
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
          const questionCount = stage.questions?.length || 0;
          const hasReflection = stage.reflection && (
            stage.reflection.whatWentWell.length > 0 || 
            stage.reflection.whatCouldImprove.length > 0
          );

          return (
            <div key={stage.id} className="relative pl-12">
              {/* Timeline dot */}
              <div className={cn(
                'absolute left-2 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-background',
                stage.status === 'completed' ? 'border-emerald-500' : 
                ['pending', 'scheduled', 'rescheduled', 'feedback_pending'].includes(stage.status) ? 'border-amber-500' : 'border-muted'
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
                          className={cn('gap-1.5', statusBadge.className)}
                          title={t('jobs.stageStatus')}
                        >
                          <StatusIcon iconName={statusBadge.icon} color={statusBadge.color} size="sm" />
                          {statusBadge.label}
                        </Badge>
                        
                        {/* Result badge - show when completed */}
                        {stage.result && STAGE_RESULT_CONFIG[stage.result] && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'gap-1.5 border-current',
                              statusColorClasses[STAGE_RESULT_CONFIG[stage.result].color]
                            )}
                          >
                            <StatusIcon 
                              iconName={STAGE_RESULT_CONFIG[stage.result].icon} 
                              color={STAGE_RESULT_CONFIG[stage.result].color} 
                              size="sm" 
                            />
                            {getResultLabel(stage.result)}
                          </Badge>
                        )}
                        
                        {/* Content indicators */}
                        {questionCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <MessageSquare className="w-3 h-3" />
                            {t('jobs.questionsCount', { count: questionCount })}
                          </div>
                        )}
                        {hasReflection && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Lightbulb className="w-3 h-3" />
                            {t('jobs.hasReflection')}
                          </div>
                        )}
                        
                        {stage.scheduledTime && stage.scheduledTimezone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            {formatDualTimezone(stage.scheduledTime, stage.scheduledTimezone)}
                          </div>
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
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {t('jobs.buildingDatabase')}
                        </div>
                        <div className="flex gap-2">
                          {/* AI Transcript Analyzer Button - Navigate to Analytics page */}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1.5"
                            onClick={() => {
                              if (jobContext?.jobId) {
                                navigate(`/analytics?jobId=${jobContext.jobId}&stageId=${stage.id}`);
                              }
                            }}
                          >
                            <Sparkles className="w-3 h-3" />
                            {t('jobs.aiAnalyzeRecord')}
                          </Button>
                          
                          {isEditing ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                                <X className="w-3 h-3 mr-1" />
                                {t('common.cancel')}
                              </Button>
                              <Button size="sm" onClick={() => saveEditing(stage.id)}>
                                <Save className="w-3 h-3 mr-1" />
                                {t('common.save')}
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => startEditing(stage)}>
                              <Pencil className="w-3 h-3 mr-1" />
                              {t('jobs.editInfo')}
                            </Button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t('jobs.stageName')}</Label>
                              <Input
                                value={editData.name || ''}
                                onChange={(e) => {
                                  const newName = e.target.value;
                                  setEditData(prev => ({
                                    ...prev,
                                    name: newName,
                                    // Auto-suggest category when name changes (only if user hasn't manually picked one different from auto)
                                    category: detectStageCategory(newName),
                                  }));
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('jobs.stageCategory', 'Category')}</Label>
                              <Select
                                value={editData.category || 'interview'}
                                onValueChange={(value) => setEditData(prev => ({ 
                                  ...prev, 
                                  category: value as StageCategory 
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STAGE_CATEGORY_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                      {config.labelZh} / {config.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>{t('jobs.stageStatus')}</Label>
                              <Select
                                value={editData.status}
                                onValueChange={(value) => setEditData(prev => ({ 
                                  ...prev, 
                                  status: value as StageStatus 
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">⏳ {t('jobs.stageStatusPending')}</SelectItem>
                                  <SelectItem value="scheduled">📅 {t('jobs.stageStatusScheduled')}</SelectItem>
                                  <SelectItem value="rescheduled">🔄 {t('jobs.stageStatusRescheduled')}</SelectItem>
                                  <SelectItem value="completed">✅ {t('jobs.stageStatusCompleted')}</SelectItem>
                                  <SelectItem value="feedback_pending">⏱️ {t('jobs.stageStatusFeedbackPending')}</SelectItem>
                                  <SelectItem value="skipped">⏭️ {t('jobs.stageStatusSkipped')}</SelectItem>
                                  <SelectItem value="withdrawn">🔙 {t('jobs.stageStatusWithdrawn')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Result - always visible */}
                            <div className="space-y-2">
                              <Label>{t('jobs.result')}</Label>
                              <Select
                                value={editData.result || '_none'}
                                onValueChange={(value) => setEditData(prev => ({ 
                                  ...prev, 
                                  result: value === '_none' ? undefined : value as 'passed' | 'rejected' | 'on_hold' | 'mixed_feedback'
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t('jobs.resultPending')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_none">🔄 {t('jobs.resultPending')}</SelectItem>
                                  <SelectItem value="passed">🎉 {t('jobs.resultPassed')}</SelectItem>
                                  <SelectItem value="rejected">❌ {t('jobs.resultRejected')}</SelectItem>
                                  <SelectItem value="on_hold">🧊 {t('jobs.resultOnHold')}</SelectItem>
                                  <SelectItem value="mixed_feedback">⚖️ {t('jobs.resultMixed')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>{t('jobs.interviewTime')}</Label>
                              <Input
                                type="datetime-local"
                                value={editData.scheduledTime || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>{t('jobs.timezone')}</Label>
                              <Select
                                value={editData.scheduledTimezone || 'Asia/Shanghai'}
                                onValueChange={(value) => setEditData(prev => ({ ...prev, scheduledTimezone: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Asia/Shanghai">{t('jobs.beijingTime')}</SelectItem>
                                  <SelectItem value="America/Los_Angeles">{t('jobs.pacificTime')}</SelectItem>
                                  <SelectItem value="America/New_York">{t('jobs.easternTime')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Content Tabs - Questions & Reflection */
                        <Tabs value={getStageTab(stage.id)} onValueChange={(v) => setStageTab(stage.id, v)}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="questions" className="gap-2">
                              <MessageSquare className="w-4 h-4" />
                              {t('jobs.questionsTab')}
                              {questionCount > 0 && (
                                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                  {questionCount}
                                </Badge>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="reflection" className="gap-2">
                              <Lightbulb className="w-4 h-4" />
                              {t('jobs.reflectionTab')}
                              {hasReflection && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              )}
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="questions" className="mt-4">
                            <QuestionRecorder
                              questions={stage.questions || []}
                              onChange={(q) => handleQuestionsChange(stage.id, q)}
                            />
                          </TabsContent>
                          
                          <TabsContent value="reflection" className="mt-4">
                            <ReflectionEditor
                              reflection={stage.reflection}
                              onChange={(r) => handleReflectionChange(stage.id, r)}
                            />
                          </TabsContent>
                        </Tabs>
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
