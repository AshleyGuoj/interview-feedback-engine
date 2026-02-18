import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UnifiedInterviewTimeline } from '@/components/jobs/UnifiedInterviewTimeline';
import { StageEditor } from '@/components/jobs/StageEditor';
import { PipelineTransferDialog } from '@/components/jobs/PipelineTransferDialog';
import { OnHoldPrompt } from '@/components/jobs/OnHoldPrompt';
import { TerminalDecisionModal } from '@/components/jobs/TerminalDecisionModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Sparkles,
  MapPin,
  Building2,
  Link as LinkIcon,
  Pencil,
  Save,
  X,
  Trash2,
  Upload,
  FileText,
  GitBranch
} from 'lucide-react';
import { Job, InterviewStage, JobStatus, JobSource, Pipeline, getActivePipeline, StageResult, DEFAULT_STAGES } from '@/types/job';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useJobs, deriveJobStatusFromStages } from '@/contexts/JobsContext';
import { useActivities } from '@/hooks/useActivities';
import { formatDualTimezone } from '@/lib/timezone';
import { resolvePipeline } from '@/lib/pipeline-resolver';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const locationColors: Record<string, string> = {
  CN: 'bg-muted text-muted-foreground',
  US: 'bg-muted text-muted-foreground',
  Remote: 'bg-muted text-muted-foreground',
  Other: 'bg-muted text-muted-foreground',
};

export default function JobDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, updateJob, deleteJob, getJob } = useJobs();
  const { addActivity } = useActivities();
  
  const job = getJob(id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([]);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [dismissedOnHoldPrompt, setDismissedOnHoldPrompt] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  
  // Source labels using i18n
  const sourceLabels: Record<string, string> = {
    linkedin: t('jobs.sourceLinkedIn'),
    boss: t('jobs.sourceBoss'),
    referral: t('jobs.sourceReferral'),
    website: t('jobs.sourceWebsite'),
    other: t('jobs.sourceOther'),
  };
  
  // Terminal decision modal state
  const [terminalModalOpen, setTerminalModalOpen] = useState(false);
  const [terminalStage, setTerminalStage] = useState<InterviewStage | null>(null);
  const [terminalResult, setTerminalResult] = useState<StageResult>(null);

  // Pipeline resolution
  const pipelineResolution = useMemo(() => {
    if (!job) return null;
    return resolvePipeline(job);
  }, [job]);

  // Get active pipeline and stages
  const activePipeline = useMemo(() => {
    if (!job) return null;
    if (selectedPipelineId && job.pipelines?.length > 0) {
      return job.pipelines.find(p => p.id === selectedPipelineId) || getActivePipeline(job);
    }
    return getActivePipeline(job);
  }, [job, selectedPipelineId]);

  const activeStages = useMemo(() => {
    return activePipeline?.stages || job?.stages || [];
  }, [activePipeline, job?.stages]);

  // Check for on_hold state to show transfer prompt
  const showOnHoldPrompt = useMemo(() => {
    if (dismissedOnHoldPrompt) return false;
    if (!pipelineResolution) return false;
    return pipelineResolution.state.type === 'on_hold';
  }, [pipelineResolution, dismissedOnHoldPrompt]);

  const onHoldStage = pipelineResolution?.state.type === 'on_hold' 
    ? pipelineResolution.state.atStage 
    : null;

  // Derive next upcoming event from stages (single source of truth)
  const nextUpcomingEvent = useMemo(() => {
    if (!job) return null;
    
    const upcomingStages = activeStages.filter(s => 
      ['pending', 'scheduled', 'rescheduled'].includes(s.status) && s.scheduledTime
    );
    
    if (upcomingStages.length === 0) return null;
    
    // Sort by scheduled time and get the earliest
    upcomingStages.sort((a, b) => 
      (a.scheduledTime || '').localeCompare(b.scheduledTime || '')
    );
    
    return upcomingStages[0];
  }, [activeStages]);

  if (!job) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Job not found</p>
          <Button variant="ghost" onClick={() => navigate('/jobs')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Board
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const startEditing = () => {
    setEditData({
      companyName: job.companyName,
      roleTitle: job.roleTitle,
      location: job.location,
      status: job.status,
      source: job.source,
      jobLink: job.jobLink,
      interestLevel: job.interestLevel,
      careerFitNotes: job.careerFitNotes,
      currentStage: job.currentStage,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditData({});
    setIsEditing(false);
  };

  const saveChanges = async () => {
    await updateJob(job.id, editData);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteJob(job.id);
    navigate('/jobs');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        setAttachments(prev => [...prev, { 
          name: file.name, 
          type: file.type,
          url 
        }]);
        toast.success(`Uploaded: ${file.name}`);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleStageUpdate = async (stageId: string, updates: Partial<InterviewStage>) => {
    const oldStage = activeStages.find(s => s.id === stageId);
    const updatedStage = { ...oldStage, ...updates } as InterviewStage;

    // Check if this update introduces a terminal result (rejected/on_hold)
    const isTerminalResult = !!updates.result && ['rejected', 'on_hold'].includes(updates.result);
    const wasNotTerminal = !oldStage?.result || !['rejected', 'on_hold'].includes(oldStage.result);

    // Debug (helps verify the trigger path)
    console.debug('[TerminalDecision]', {
      stageId,
      updates,
      oldResult: oldStage?.result,
      pipelineStatus: activePipeline?.status,
      isTerminalResult,
      wasNotTerminal,
    });

    // If terminal result is being set, show decision modal instead of auto-processing
    if (isTerminalResult && wasNotTerminal) {
      toast.message('需要确认下一步：关闭还是转岗？');
      setTerminalStage(updatedStage);
      setTerminalResult(updates.result ?? null);
      setTerminalModalOpen(true);
      return; // Don't update yet - wait for modal decision
    }

    // Normal update flow
    await performStageUpdate(stageId, updates);
  };

  // Separated update logic for reuse
  const performStageUpdate = async (stageId: string, updates: Partial<InterviewStage>) => {
    const oldStage = activeStages.find(s => s.id === stageId);
    const updatedStages = activeStages.map(s => 
      s.id === stageId ? { ...s, ...updates } : s
    );
    
    // Update the active pipeline's stages
    if (activePipeline && job.pipelines?.length > 0) {
      const updatedPipelines = job.pipelines.map(p => 
        p.id === activePipeline.id ? { ...p, stages: updatedStages } : p
      );
      
      // Derive new job status from stages
      const newStatus = deriveJobStatusFromStages(updatedStages, job.status);
      const statusChanged = newStatus !== job.status;
      
      await updateJob(job.id, { 
        pipelines: updatedPipelines,
        stages: updatedStages, // Keep legacy stages in sync
        ...(statusChanged ? { status: newStatus } : {})
      });
    } else {
      // Legacy: update stages directly
      const newStatus = deriveJobStatusFromStages(updatedStages, job.status);
      const statusChanged = newStatus !== job.status;
      
      await updateJob(job.id, { 
        stages: updatedStages,
        ...(statusChanged ? { status: newStatus } : {})
      });
    }
    
    // Log activity for stage updates
    const stageName = oldStage?.name || 'Stage';
    
    if (updates.status && oldStage?.status !== updates.status) {
      const activityType = updates.status === 'completed' ? 'stage_completed' : 'stage_updated';
      const message = updates.status === 'completed'
        ? `${job.companyName} — ${stageName} completed`
        : `${job.companyName} — ${stageName} marked as ${updates.status}`;
      
      await addActivity({
        jobId: job.id,
        type: activityType,
        message,
        metadata: { 
          stageName, 
          oldStatus: oldStage?.status, 
          newStatus: updates.status 
        }
      });
    }
    
    if (updates.scheduledTime && updates.scheduledTime !== oldStage?.scheduledTime) {
      const timezone = updates.scheduledTimezone || oldStage?.scheduledTimezone || 'Asia/Shanghai';
      const timeDisplay = formatDualTimezone(updates.scheduledTime, timezone);
      
      await addActivity({
        jobId: job.id,
        type: 'interview_scheduled',
        message: `${job.companyName} — ${stageName} scheduled for ${timeDisplay}`,
        metadata: { 
          stageName, 
          scheduledTime: updates.scheduledTime,
          scheduledTimezone: timezone
        }
      });
    }

    // Log terminal result
    if (updates.result && ['rejected', 'on_hold'].includes(updates.result)) {
      const resultMessages: Record<string, string> = {
        rejected: 'not passed',
        on_hold: 'put on hold (hiring freeze)',
      };
      
      await addActivity({
        jobId: job.id,
        type: 'stage_updated',
        message: `${job.companyName} — ${stageName} ${resultMessages[updates.result]}`,
        metadata: { 
          stageName, 
          result: updates.result 
        }
      });
    }
  };

  // Handle terminal modal decisions
  const handleTerminalClosePipeline = async () => {
    if (!terminalStage || !terminalResult) return;
    
    // Update stage result AND close pipeline in a single atomic update
    const updatedStages = activeStages.map(s => 
      s.id === terminalStage.id ? { ...s, result: terminalResult } : s
    );
    
    if (activePipeline && job.pipelines?.length > 0) {
      const updatedPipelines = job.pipelines.map(p => 
        p.id === activePipeline.id 
          ? { 
              ...p, 
              status: 'closed' as const, 
              closedAt: new Date().toISOString(), 
              closedReason: terminalResult === 'rejected' ? 'rejected_after_interview' as const : 'hc_frozen' as const,
              stages: updatedStages, // Include updated stage result
            }
          : p
      );
      
      // Derive new job status - should become 'closed' if all pipelines are terminal
      const newStatus = deriveJobStatusFromStages(updatedStages, job.status);
      
      await updateJob(job.id, { 
        pipelines: updatedPipelines,
        stages: updatedStages, // Keep legacy stages in sync
        status: 'closed', // Explicitly set to closed since pipeline is closing
      });
    } else {
      // Legacy: update stages directly
      await updateJob(job.id, { 
        stages: updatedStages,
        status: 'closed',
      });
    }
    
    // Log activity
    await addActivity({
      jobId: job.id,
      type: 'stage_updated',
      message: `${job.companyName} — ${terminalStage.name} ${terminalResult === 'rejected' ? 'not passed' : 'put on hold (hiring freeze)'}`,
      metadata: { 
        stageName: terminalStage.name, 
        result: terminalResult 
      }
    });
    
    toast.success('Pipeline closed');
  };

  const handleTerminalTransfer = async (newRole: string) => {
    if (!terminalStage || !terminalResult) return;
    
    // Update stage result in the current pipeline
    const updatedStages = activeStages.map(s => 
      s.id === terminalStage.id ? { ...s, result: terminalResult } : s
    );
    
    // Create a new transfer pipeline
    const newPipeline: Pipeline = {
      id: `pipeline-${Date.now()}`,
      type: 'transfer',
      status: 'active',
      targetRole: newRole,
      originPipelineId: activePipeline?.id,
      transferReason: terminalResult === 'on_hold' ? 'hc_freeze' : 'better_fit',
      createdAt: new Date().toISOString(),
      stages: DEFAULT_STAGES.map((s, i) => ({
        ...s,
        id: `stage-${Date.now()}-${i}`,
      })) as InterviewStage[],
    };
    
    // Update current pipeline with terminal result AND add new pipeline atomically
    const updatedPipelines = (job.pipelines || []).map(p => 
      p.id === activePipeline?.id 
        ? { 
            ...p, 
            status: 'closed' as const, 
            closedAt: new Date().toISOString(),
            closedReason: terminalResult === 'rejected' ? 'rejected_after_interview' as const : 'hc_frozen' as const,
            stages: updatedStages,
          } 
        : p
    );
    updatedPipelines.push(newPipeline);
    
    await updateJob(job.id, { 
      pipelines: updatedPipelines,
      roleTitle: newRole, // Update to new role
      stages: newPipeline.stages, // Sync legacy stages with new pipeline
      status: 'interviewing', // New pipeline means active again
    });
    
    // Log activity
    await addActivity({
      jobId: job.id,
      type: 'stage_updated',
      message: `${job.companyName} — Transferred to ${newRole} from ${terminalStage.name}`,
      metadata: { 
        stageName: terminalStage.name, 
        result: terminalResult,
        newRole,
      }
    });
    
    toast.success(`Transferred to ${newRole}`);
  };

  const handleStagesChange = async (newStages: InterviewStage[]) => {
    if (activePipeline && job.pipelines?.length > 0) {
      const updatedPipelines = job.pipelines.map(p => 
        p.id === activePipeline.id ? { ...p, stages: newStages } : p
      );
      const nextStatus = deriveJobStatusFromStages(newStages, job.status);
      await updateJob(job.id, {
        pipelines: updatedPipelines,
        stages: newStages,
        status: nextStatus,
      });
    } else {
      const nextStatus = deriveJobStatusFromStages(newStages, job.status);
      await updateJob(job.id, {
        stages: newStages,
        status: nextStatus,
      });
    }
  };

  const handleCreatePipelineBranch = async (newPipeline: Omit<Pipeline, 'id' | 'createdAt'>) => {
    const pipelineWithId: Pipeline = {
      ...newPipeline,
      id: `pipeline-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Mark current active pipeline as paused if it exists
    const updatedPipelines = (job.pipelines || []).map(p => 
      p.id === activePipeline?.id ? { ...p, status: 'paused' as const } : p
    );

    // Add new pipeline and update job role to new target
    await updateJob(job.id, {
      pipelines: [...updatedPipelines, pipelineWithId],
      roleTitle: pipelineWithId.targetRole, // Update job role to new target
      stages: pipelineWithId.stages, // Keep legacy stages in sync
    });

    // Select the new pipeline
    setSelectedPipelineId(pipelineWithId.id);
    
    // Log activity
    await addActivity({
      jobId: job.id,
      type: 'pipeline_transfer',
      message: `${job.companyName} — Transferred to ${pipelineWithId.targetRole}`,
      metadata: { 
        fromRole: activePipeline?.targetRole,
        toRole: pipelineWithId.targetRole,
        reason: newPipeline.transferReason,
      }
    });

    toast.success(`Created transfer pipeline: ${pipelineWithId.targetRole}`);
    setDismissedOnHoldPrompt(true);
  };

  const handleAIAction = (action: 'summarize' | 'suggest-prep' | 'extract-insights', stageId?: string) => {
    toast.info(`AI ${action} feature coming soon!`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl space-y-6">
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/jobs')}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Board
          </Button>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={saveChanges}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this job?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete {job.companyName} - {job.roleTitle} and all its interview data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        {/* Job Overview Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                {isEditing ? (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                          value={editData.companyName || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role Title</Label>
                        <Input
                          value={editData.roleTitle || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, roleTitle: e.target.value }))}
                          placeholder="Role title"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                          value={editData.location}
                          onValueChange={(value) => setEditData(prev => ({ ...prev, location: value as Job['location'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CN">China</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editData.status}
                          onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as JobStatus }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interviewing">Interviewing</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-[28px] sm:text-[32px]">{job.companyName}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={cn('text-xs font-medium', locationColors[job.location])}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground">{job.roleTitle}</p>
                  </>
                )}
              </div>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-primary hover:text-primary"
                  onClick={() => handleAIAction('extract-insights')}
                >
                  <Sparkles className="w-4 h-4" />
                  Extract insights
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select
                      value={editData.source}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, source: value as JobSource }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="boss">BOSS直聘</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="website">Company Website</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Interest Level</Label>
                    <Select
                      value={String(editData.interestLevel)}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, interestLevel: Number(value) as Job['interestLevel'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(level => (
                          <SelectItem key={level} value={String(level)}>
                            {level} Star{level > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Job Link</Label>
                  <Input
                    value={editData.jobLink || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, jobLink: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Stage</Label>
                  <Input
                    value={editData.currentStage || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, currentStage: e.target.value }))}
                    placeholder="e.g. Round 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Career Fit Notes</Label>
                  <Textarea
                    value={editData.careerFitNotes || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, careerFitNotes: e.target.value }))}
                    placeholder="Why this role fits your career goals..."
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Source */}
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Source
                    </p>
                    <p className="font-medium">{sourceLabels[job.source]}</p>
                  </div>
                  
                  {/* Job Link */}
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Job Link
                    </p>
                    {job.jobLink ? (
                      <a 
                        href={job.jobLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        View posting
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground">—</p>
                    )}
                  </div>

                  {/* Interest Level */}
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Interest Level</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Star
                          key={level}
                          className={cn(
                            'w-4 h-4',
                            level <= job.interestLevel
                              ? 'fill-primary text-primary'
                              : 'text-muted'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="secondary" className="capitalize">{job.status}</Badge>
                  </div>
                </div>

                {/* Next Action - Derived from Interview Timeline */}
                {nextUpcomingEvent && nextUpcomingEvent.scheduledTime && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Next Action</p>
                    <p className="text-sm font-medium">
                      {formatDualTimezone(nextUpcomingEvent.scheduledTime, nextUpcomingEvent.scheduledTimezone || 'Asia/Shanghai')}
                    </p>
                  </div>
                )}

                {/* Career Fit Notes */}
                {job.careerFitNotes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Career Fit Notes</p>
                    <p className="text-sm">{job.careerFitNotes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* File Attachments */}
        <div className="border-l-2 border-l-primary/30 pl-5 space-y-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Attachments
          </h3>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm"
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button 
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg"
              />
              <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Upload files (Resume, JD, Notes...)
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* On Hold Prompt */}
        {showOnHoldPrompt && onHoldStage && (
          <OnHoldPrompt 
            stage={onHoldStage}
            onCreateTransfer={() => setShowTransferDialog(true)}
            onDismiss={() => setDismissedOnHoldPrompt(true)}
          />
        )}

        {/* Interview Timeline - Shows all pipelines with transfer history */}
        <UnifiedInterviewTimeline
          job={job}
          onStageUpdate={handleStageUpdate}
          onStagesChange={handleStagesChange}
          onOpenTransfer={() => setShowTransferDialog(true)}
          onOpenCustomize={() => {/* StageEditor handles its own open state */}}
          activePipelineId={selectedPipelineId}
          onSelectPipeline={setSelectedPipelineId}
          jobContext={{ jobId: job.id, company: job.companyName, role: activePipeline?.targetRole || job.roleTitle }}
        />

        {/* Pipeline Transfer Dialog */}
        <PipelineTransferDialog
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
          currentPipeline={activePipeline}
          companyName={job.companyName}
          onCreateBranch={handleCreatePipelineBranch}
        />

        {/* Terminal Decision Modal */}
        {terminalStage && (
          <TerminalDecisionModal
            open={terminalModalOpen}
            onOpenChange={setTerminalModalOpen}
            stage={terminalStage}
            result={terminalResult}
            currentPipeline={activePipeline}
            companyName={job.companyName}
            onClosePipeline={handleTerminalClosePipeline}
            onTransfer={handleTerminalTransfer}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
