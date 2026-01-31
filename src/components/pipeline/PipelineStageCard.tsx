import { useState } from 'react';
import { 
  PipelineStage, 
  StageStatus, 
  SubStatus,
  RiskTag,
  STATUS_CONFIG, 
  RISK_TAG_CONFIG,
  OWNER_CONFIG,
  ROUND_TYPE_CONFIG,
  DEFAULT_STAGE_CONFIGS
} from '@/types/interview-pipeline';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronDown, 
  Check, 
  Clock, 
  Circle, 
  AlertTriangle, 
  XCircle,
  Calendar,
  User,
  MessageSquare,
  Flag,
  Pencil,
  Save,
  X,
  MapPin,
  Video,
  Star,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDualTimezone } from '@/lib/timezone';

interface PipelineStageCardProps {
  stage: PipelineStage;
  isLast: boolean;
  onUpdate: (stageId: string, updates: Partial<PipelineStage>) => void;
}

export function PipelineStageCard({ stage, isLast, onUpdate }: PipelineStageCardProps) {
  const [isOpen, setIsOpen] = useState(stage.status === 'in_progress');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<PipelineStage>>({});

  const statusConfig = STATUS_CONFIG[stage.status];
  const stageConfig = DEFAULT_STAGE_CONFIGS.find(c => c.category === stage.category);

  const getStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 animate-pulse" />;
      case 'upcoming':
        return <Circle className="w-4 h-4" />;
      case 'on_hold':
        return <AlertTriangle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getTimelineColor = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-500 bg-emerald-500';
      case 'in_progress':
        return 'border-blue-500 bg-blue-500';
      case 'upcoming':
        return 'border-muted bg-muted';
      case 'on_hold':
        return 'border-orange-500 bg-orange-500';
      case 'failed':
        return 'border-red-500 bg-red-500';
    }
  };

  const startEditing = () => {
    setEditData({
      status: stage.status,
      subStatus: stage.subStatus,
      notes: stage.notes,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditData({});
    setIsEditing(false);
  };

  const saveEditing = () => {
    onUpdate(stage.id, editData);
    setIsEditing(false);
  };

  const cycleStatus = () => {
    const statusOrder: StageStatus[] = ['upcoming', 'in_progress', 'completed', 'on_hold', 'failed'];
    const currentIndex = statusOrder.indexOf(stage.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onUpdate(stage.id, { status: nextStatus });
  };

  const renderRiskTags = (tags?: RiskTag[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => {
          const config = RISK_TAG_CONFIG[tag];
          return (
            <Badge 
              key={tag} 
              variant="outline" 
              className={cn(
                'text-xs font-medium gap-1',
                config.color === 'red' && 'border-red-300 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-900/20',
                config.color === 'orange' && 'border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:bg-orange-900/20',
                config.color === 'yellow' && 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-900/20',
                config.color === 'purple' && 'border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:bg-purple-900/20',
                config.color === 'blue' && 'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-900/20',
                config.color === 'pink' && 'border-pink-300 text-pink-700 bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:bg-pink-900/20',
                config.color === 'amber' && 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-900/20',
                config.color === 'slate' && 'border-slate-300 text-slate-700 bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:bg-slate-900/20',
              )}
            >
              <Flag className="w-3 h-3" />
              {config.labelZh}
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderFeedback = () => {
    if (!stage.feedback || stage.feedback.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          面试反馈
        </div>
        {stage.feedback.map((fb, idx) => (
          <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{fb.interviewerName}</span>
                {fb.interviewerTitle && (
                  <span className="text-xs text-muted-foreground">({fb.interviewerTitle})</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={cn(
                      'w-3.5 h-3.5',
                      star <= fb.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'
                    )} 
                  />
                ))}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                fb.recommendation === 'strong_hire' && 'border-emerald-500 text-emerald-700 bg-emerald-50',
                fb.recommendation === 'hire' && 'border-green-500 text-green-700 bg-green-50',
                fb.recommendation === 'neutral' && 'border-gray-400 text-gray-600 bg-gray-50',
                fb.recommendation === 'no_hire' && 'border-orange-500 text-orange-700 bg-orange-50',
                fb.recommendation === 'strong_no_hire' && 'border-red-500 text-red-700 bg-red-50',
              )}
            >
              {fb.recommendation === 'strong_hire' && '强烈推荐'}
              {fb.recommendation === 'hire' && '推荐'}
              {fb.recommendation === 'neutral' && '中立'}
              {fb.recommendation === 'no_hire' && '不推荐'}
              {fb.recommendation === 'strong_no_hire' && '强烈不推荐'}
            </Badge>
            {fb.strengths.length > 0 && (
              <div className="text-xs">
                <span className="text-emerald-600 font-medium">优势: </span>
                {fb.strengths.join('、')}
              </div>
            )}
            {fb.concerns.length > 0 && (
              <div className="text-xs">
                <span className="text-orange-600 font-medium">顾虑: </span>
                {fb.concerns.join('、')}
              </div>
            )}
            {fb.notes && <p className="text-xs text-muted-foreground">{fb.notes}</p>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative pl-10">
      {/* Timeline line */}
      {!isLast && (
        <div className={cn(
          'absolute left-[15px] top-8 bottom-0 w-0.5',
          stage.status === 'completed' ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-border'
        )} />
      )}
      
      {/* Timeline dot */}
      <div className={cn(
        'absolute left-1 top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
        getTimelineColor(stage.status),
        stage.status === 'completed' && 'text-white',
        stage.status === 'in_progress' && 'text-white',
        stage.status === 'failed' && 'text-white',
        stage.status === 'on_hold' && 'text-white',
        stage.status === 'upcoming' && 'text-muted-foreground',
      )}>
        {getStatusIcon(stage.status)}
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className={cn(
          'transition-all mb-4',
          stage.status === 'in_progress' && 'ring-2 ring-blue-500/30 shadow-md',
          stage.status === 'failed' && 'opacity-70',
          isOpen && 'shadow-lg'
        )}>
          <CollapsibleTrigger asChild>
            <div className="flex items-start justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex-1 space-y-2">
                {/* Stage Header */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-base">{stage.nameZh || stage.name}</span>
                  {stage.roundType && (
                    <Badge variant="outline" className="text-xs">
                      {ROUND_TYPE_CONFIG[stage.roundType]?.labelZh || stage.roundType}
                    </Badge>
                  )}
                  <Badge 
                    className={cn(
                      'text-xs cursor-pointer transition-colors',
                      statusConfig.bgColor,
                      statusConfig.color
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      cycleStatus();
                    }}
                    title="点击切换状态"
                  >
                    {statusConfig.labelZh}
                  </Badge>
                  {stage.subStatus && stageConfig && (
                    <Badge variant="secondary" className="text-xs">
                      {stageConfig.subStatuses.find(s => s.id === stage.subStatus)?.labelZh || stage.subStatus}
                    </Badge>
                  )}
                </div>

                {/* Schedule & Owner Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  {stage.owner && (
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {stage.ownerName || OWNER_CONFIG[stage.owner]?.labelZh}
                    </div>
                  )}
                  {stage.scheduledEvent && (
                    <>
                      <div className="flex items-center gap-1 text-primary">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDualTimezone(stage.scheduledEvent.dateTime, stage.scheduledEvent.timezone)}
                      </div>
                      {stage.scheduledEvent.duration && (
                        <span>{stage.scheduledEvent.duration}分钟</span>
                      )}
                      {stage.scheduledEvent.meetingLink && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Video className="w-3.5 h-3.5" />
                          视频会议
                        </div>
                      )}
                      {stage.scheduledEvent.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {stage.scheduledEvent.location}
                        </div>
                      )}
                    </>
                  )}
                  {stage.completedAt && (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                      完成于 {new Date(stage.completedAt).toLocaleDateString('zh-CN')}
                    </div>
                  )}
                </div>

                {/* Risk Tags */}
                {stage.riskTags && stage.riskTags.length > 0 && (
                  <div className="pt-1">
                    {renderRiskTags(stage.riskTags)}
                  </div>
                )}
              </div>

              <ChevronDown className={cn(
                'w-5 h-5 text-muted-foreground transition-transform shrink-0 mt-1',
                isOpen && 'rotate-180'
              )} />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 space-y-4 border-t">
              {/* Edit Controls */}
              <div className="flex justify-end gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={cancelEditing}>
                      <X className="w-3 h-3 mr-1" />
                      取消
                    </Button>
                    <Button size="sm" onClick={saveEditing}>
                      <Save className="w-3 h-3 mr-1" />
                      保存
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Pencil className="w-3 h-3 mr-1" />
                    编辑
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  {/* Status & Sub-status Editor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">状态</label>
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
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.labelZh}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {stageConfig && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">子状态</label>
                        <Select
                          value={editData.subStatus || ''}
                          onValueChange={(value) => setEditData(prev => ({ 
                            ...prev, 
                            subStatus: value as SubStatus 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择子状态" />
                          </SelectTrigger>
                          <SelectContent>
                            {stageConfig.subStatuses.map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.labelZh}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Notes Editor */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">备注</label>
                    <Textarea
                      value={editData.notes || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="添加备注..."
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Notes Display */}
                  {stage.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">{stage.notes}</p>
                    </div>
                  )}

                  {/* Feedback Section */}
                  {renderFeedback()}

                  {/* Deadline Info */}
                  {stage.deadline && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800 dark:text-amber-300">
                        截止时间: {formatDualTimezone(stage.deadline.dateTime, stage.deadline.timezone)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
