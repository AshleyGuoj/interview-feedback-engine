import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InterviewStage, InterviewFormat, InterviewQuestion, InterviewReflection, StageStatus, StageResult, STAGE_STATUS_CONFIG, STAGE_RESULT_CONFIG } from '@/types/job';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      status: stage.status,
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
    if (!config) return { label: status, className: statusColorClasses.gray };
    return {
      label: `${config.emoji} ${config.labelZh}`,
      className: statusColorClasses[config.color] || statusColorClasses.gray
    };
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
                          className={cn(statusBadge.className)}
                          title="Stage status"
                        >
                          {statusBadge.label}
                        </Badge>
                        
                        {/* Result badge - show when completed */}
                        {stage.result && STAGE_RESULT_CONFIG[stage.result] && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'border-current',
                              statusColorClasses[STAGE_RESULT_CONFIG[stage.result].color]
                            )}
                          >
                            {STAGE_RESULT_CONFIG[stage.result].emoji} {STAGE_RESULT_CONFIG[stage.result].labelZh}
                          </Badge>
                        )}
                        
                        {/* Content indicators */}
                        {questionCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <MessageSquare className="w-3 h-3" />
                            {questionCount}题
                          </div>
                        )}
                        {hasReflection && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Lightbulb className="w-3 h-3" />
                            已反思
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
                          记录面试内容，构建你的面试数据库
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
                            AI 分析记录
                          </Button>
                          
                          {isEditing ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={cancelEditing}>
                                <X className="w-3 h-3 mr-1" />
                                取消
                              </Button>
                              <Button size="sm" onClick={() => saveEditing(stage.id)}>
                                <Save className="w-3 h-3 mr-1" />
                                保存
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => startEditing(stage)}>
                              <Pencil className="w-3 h-3 mr-1" />
                              编辑信息
                            </Button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>阶段名称</Label>
                              <Input
                                value={editData.name || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>状态</Label>
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
                                  <SelectItem value="pending">⏳ 待进行</SelectItem>
                                  <SelectItem value="scheduled">📅 已安排</SelectItem>
                                  <SelectItem value="rescheduled">🔄 已改期</SelectItem>
                                  <SelectItem value="completed">✅ 已完成</SelectItem>
                                  <SelectItem value="feedback_pending">⏱️ 等反馈</SelectItem>
                                  <SelectItem value="skipped">⏭️ 已跳过</SelectItem>
                                  <SelectItem value="withdrawn">🔙 已撤回</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Result - only shown when completed */}
                            {(editData.status === 'completed' || editData.status === 'feedback_pending') && (
                              <div className="space-y-2">
                                <Label>结果</Label>
                                <Select
                                  value={editData.result || ''}
                                  onValueChange={(value) => setEditData(prev => ({ 
                                    ...prev, 
                                    result: value === '' ? null : value as 'passed' | 'rejected' | 'on_hold' | 'mixed_feedback'
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="选择结果..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">🔄 待定</SelectItem>
                                    <SelectItem value="passed">🎉 通过</SelectItem>
                                    <SelectItem value="rejected">❌ 未通过</SelectItem>
                                    <SelectItem value="on_hold">🧊 HC冻结</SelectItem>
                                    <SelectItem value="mixed_feedback">⚖️ 意见不一</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>面试时间</Label>
                              <Input
                                type="datetime-local"
                                value={editData.scheduledTime || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>时区</Label>
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
                      ) : (
                        /* Content Tabs - Questions & Reflection */
                        <Tabs value={getStageTab(stage.id)} onValueChange={(v) => setStageTab(stage.id, v)}>
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="questions" className="gap-2">
                              <MessageSquare className="w-4 h-4" />
                              问题记录
                              {questionCount > 0 && (
                                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                  {questionCount}
                                </Badge>
                              )}
                            </TabsTrigger>
                            <TabsTrigger value="reflection" className="gap-2">
                              <Lightbulb className="w-4 h-4" />
                              反思复盘
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
