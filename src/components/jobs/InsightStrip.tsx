import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Job, JobStatus, InterviewingSubStatus, OfferSubStatus, ClosedReason } from '@/types/job';
import { cn } from '@/lib/utils';

interface InsightStripProps {
  status: JobStatus;
  jobs: Job[];
}

type SubStatusCount = {
  key: string;
  emoji: string;
  labelKey: string;
  count: number;
  color: string;
};

// Config with i18n keys
const SUB_STATUS_I18N: Record<InterviewingSubStatus | OfferSubStatus, { labelKey: string; emoji: string; color: string }> = {
  interview_scheduled: { labelKey: 'jobs.subStatusScheduled', emoji: '📅', color: 'blue' },
  feedback_pending: { labelKey: 'jobs.subStatusFeedbackPending', emoji: '⏳', color: 'amber' },
  approval_pending: { labelKey: 'jobs.subStatusApprovalPending', emoji: '⚠️', color: 'orange' },
  hr_followup: { labelKey: 'jobs.subStatusHrFollowup', emoji: '🧑‍💼', color: 'purple' },
  preparing: { labelKey: 'jobs.subStatusPreparing', emoji: '📚', color: 'cyan' },
  offer_discussion: { labelKey: 'jobs.subStatusDiscussing', emoji: '💬', color: 'blue' },
  offer_pending: { labelKey: 'jobs.subStatusOfferPending', emoji: '⏳', color: 'amber' },
  offer_received: { labelKey: 'jobs.subStatusOfferReceived', emoji: '📩', color: 'green' },
  negotiating: { labelKey: 'jobs.subStatusNegotiating', emoji: '🤝', color: 'purple' },
};

const CLOSED_REASON_I18N: Record<ClosedReason, { labelKey: string; emoji: string; color: string }> = {
  rejected_after_interview: { labelKey: 'jobs.closedRejected', emoji: '❌', color: 'red' },
  rejected_resume: { labelKey: 'jobs.closedResumeRejected', emoji: '📄', color: 'gray' },
  no_response: { labelKey: 'jobs.closedNoResponse', emoji: '💤', color: 'gray' },
  withdrawn: { labelKey: 'jobs.closedWithdrawn', emoji: '🔁', color: 'blue' },
  hc_frozen: { labelKey: 'jobs.closedHcFrozen', emoji: '🚫', color: 'orange' },
  position_cancelled: { labelKey: 'jobs.closedCancelled', emoji: '❌', color: 'gray' },
  offer_declined: { labelKey: 'jobs.closedDeclinedOffer', emoji: '🙅', color: 'purple' },
};

export function InsightStrip({ status, jobs }: InsightStripProps) {
  const { t } = useTranslation();
  
  const insights = useMemo(() => {
    if (jobs.length === 0) return [];

    if (status === 'interviewing') {
      // Count by sub-status for interviewing
      const counts: Record<string, number> = {};
      jobs.forEach(job => {
        const subStatus = job.subStatus || 'preparing';
        counts[subStatus] = (counts[subStatus] || 0) + 1;
      });
      
      return Object.entries(counts)
        .map(([key, count]): SubStatusCount => {
          const config = SUB_STATUS_I18N[key as InterviewingSubStatus];
          return {
            key,
            emoji: config?.emoji || '📋',
            labelKey: config?.labelKey || key,
            count,
            color: config?.color || 'gray',
          };
        })
        .sort((a, b) => b.count - a.count);
    }

    if (status === 'offer') {
      // Count by offer sub-status
      const counts: Record<string, number> = {};
      jobs.forEach(job => {
        const subStatus = job.subStatus || 'offer_pending';
        counts[subStatus] = (counts[subStatus] || 0) + 1;
      });
      
      return Object.entries(counts)
        .map(([key, count]): SubStatusCount => {
          const config = SUB_STATUS_I18N[key as OfferSubStatus];
          return {
            key,
            emoji: config?.emoji || '📋',
            labelKey: config?.labelKey || key,
            count,
            color: config?.color || 'gray',
          };
        })
        .sort((a, b) => b.count - a.count);
    }

    if (status === 'closed') {
      // Count by closed reason
      const counts: Record<string, number> = {};
      jobs.forEach(job => {
        const reason = job.closedReason || 'no_response';
        counts[reason] = (counts[reason] || 0) + 1;
      });
      
      return Object.entries(counts)
        .map(([key, count]): SubStatusCount => {
          const config = CLOSED_REASON_I18N[key as ClosedReason];
          return {
            key,
            emoji: config?.emoji || '📋',
            labelKey: config?.labelKey || key,
            count,
            color: config?.color || 'gray',
          };
        })
        .sort((a, b) => b.count - a.count);
    }

    return [];
  }, [status, jobs]);

  if (insights.length === 0) return null;

  const colorToClass: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    orange: 'text-orange-600 dark:text-orange-400',
    purple: 'text-purple-600 dark:text-purple-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-500 dark:text-gray-400',
  };

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
      {insights.slice(0, 4).map((insight) => (
        <span 
          key={insight.key} 
          className={cn('flex items-center gap-0.5', colorToClass[insight.color])}
        >
          <span>{insight.emoji}</span>
          <span className="font-medium">{insight.count}</span>
          <span className="text-muted-foreground hidden sm:inline">{t(insight.labelKey)}</span>
        </span>
      ))}
    </div>
  );
}
