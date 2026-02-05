import { InterviewStage, Pipeline, StageStatus } from '@/types/job';

// Statuses that indicate real progress happened
const MEANINGFUL_STATUSES: StageStatus[] = [
  'completed',
  'feedback_pending',
  'rescheduled',
  'withdrawn',
  'skipped',
];

// Results that indicate meaningful outcome
const MEANINGFUL_RESULTS = ['passed', 'rejected', 'on_hold', 'mixed_feedback'];

/**
 * Determines if a stage reached a meaningful state (not just pending/scheduled)
 */
export function isMeaningfulStage(stage: InterviewStage): boolean {
  // Has a meaningful status
  if (MEANINGFUL_STATUSES.includes(stage.status)) {
    return true;
  }
  
  // Has any result
  if (stage.result) {
    return true;
  }
  
  // Scheduled counts as meaningful if it had a time set (interview was planned)
  if (stage.status === 'scheduled' && stage.scheduledTime) {
    return true;
  }
  
  return false;
}

/**
 * Get the index of the last meaningful stage in a pipeline
 * Returns -1 if no meaningful stages
 */
export function getLastMeaningfulStageIndex(stages: InterviewStage[]): number {
  for (let i = stages.length - 1; i >= 0; i--) {
    if (isMeaningfulStage(stages[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Filter stages to only include meaningful ones for inactive pipelines
 * Active pipelines show all stages
 */
export function getDisplayStages(pipeline: Pipeline, isActive: boolean): InterviewStage[] {
  if (isActive) {
    return pipeline.stages;
  }
  
  // For inactive pipelines, only show up to last meaningful stage
  const lastIndex = getLastMeaningfulStageIndex(pipeline.stages);
  
  if (lastIndex === -1) {
    // No meaningful stages - show nothing
    return [];
  }
  
  return pipeline.stages.slice(0, lastIndex + 1);
}

/**
 * Get terminal reason display text
 */
export function getTerminalReasonLabel(pipeline: Pipeline): string {
  if (pipeline.transferReason) {
    const reasons: Record<string, string> = {
      hc_freeze: 'HC 冻结后转岗',
      better_fit: '更适合新岗位',
      team_change: '团队调整',
      reorg: '组织架构变更',
    };
    return reasons[pipeline.transferReason] || '转岗至新角色';
  }
  
  if (pipeline.status === 'closed') {
    return '流程已结束';
  }
  
  if (pipeline.status === 'paused') {
    return '流程已暂停';
  }
  
  return '已转移';
}

/**
 * Get summary text for collapsed pipeline
 */
export function getPipelineSummary(pipeline: Pipeline): string {
  const meaningfulStages = pipeline.stages.filter(isMeaningfulStage);
  const completed = meaningfulStages.filter(s => s.status === 'completed').length;
  const passed = meaningfulStages.filter(s => s.result === 'passed').length;
  
  if (completed === 0) {
    return '无面试记录';
  }
  
  return `完成 ${completed} 轮${passed > 0 ? ` · ${passed} 轮通过` : ''}`;
}
