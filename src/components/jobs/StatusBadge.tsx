import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { 
  InterviewingSubStatus, 
  OfferSubStatus, 
  RiskTag, 
  ClosedReason,
} from '@/types/job';
import { cn } from '@/lib/utils';

interface SubStatusBadgeProps {
  subStatus: InterviewingSubStatus | OfferSubStatus;
  size?: 'sm' | 'default';
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// Sub-status config with i18n keys
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

export function SubStatusBadge({ subStatus, size = 'default' }: SubStatusBadgeProps) {
  const { t } = useTranslation();
  const config = SUB_STATUS_I18N[subStatus];
  if (!config) return null;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        colorClasses[config.color],
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'
      )}
    >
      <span className="mr-1">{config.emoji}</span>
      {t(config.labelKey)}
    </Badge>
  );
}

interface RiskTagBadgeProps {
  tag: RiskTag;
  size?: 'sm' | 'default';
}

// Risk tag config with i18n keys
const RISK_TAG_I18N: Record<RiskTag, { labelKey: string; emoji: string; color: string }> = {
  hc_risk: { labelKey: 'jobs.riskHcRisk', emoji: '⚠️', color: 'red' },
  long_silence: { labelKey: 'jobs.riskLongSilence', emoji: '🕒', color: 'gray' },
  extra_round: { labelKey: 'jobs.riskExtraRound', emoji: '🔁', color: 'orange' },
  competing_offer: { labelKey: 'jobs.riskCompetingOffer', emoji: '💰', color: 'green' },
  timeline_delay: { labelKey: 'jobs.riskDelayed', emoji: '⏰', color: 'amber' },
  salary_gap: { labelKey: 'jobs.riskSalaryGap', emoji: '💵', color: 'red' },
  lowball_offer: { labelKey: 'jobs.riskLowball', emoji: '📉', color: 'red' },
};

export function RiskTagBadge({ tag, size = 'default' }: RiskTagBadgeProps) {
  const { t } = useTranslation();
  const config = RISK_TAG_I18N[tag];
  if (!config) return null;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'border-current',
        colorClasses[config.color],
        size === 'sm' ? 'text-[10px] px-1 py-0' : 'text-xs'
      )}
    >
      <span className="mr-0.5">{config.emoji}</span>
      {size === 'default' && t(config.labelKey)}
    </Badge>
  );
}

interface ClosedReasonBadgeProps {
  reason: ClosedReason;
  size?: 'sm' | 'default';
}

// Closed reason config with i18n keys
const CLOSED_REASON_I18N: Record<ClosedReason, { labelKey: string; emoji: string; color: string }> = {
  rejected_after_interview: { labelKey: 'jobs.closedRejected', emoji: '❌', color: 'red' },
  rejected_resume: { labelKey: 'jobs.closedResumeRejected', emoji: '📄', color: 'gray' },
  no_response: { labelKey: 'jobs.closedNoResponse', emoji: '💤', color: 'gray' },
  withdrawn: { labelKey: 'jobs.closedWithdrawn', emoji: '🔁', color: 'blue' },
  hc_frozen: { labelKey: 'jobs.closedHcFrozen', emoji: '🚫', color: 'orange' },
  position_cancelled: { labelKey: 'jobs.closedCancelled', emoji: '❌', color: 'gray' },
  offer_declined: { labelKey: 'jobs.closedDeclinedOffer', emoji: '🙅', color: 'purple' },
};

export function ClosedReasonBadge({ reason, size = 'default' }: ClosedReasonBadgeProps) {
  const { t } = useTranslation();
  const config = CLOSED_REASON_I18N[reason];
  if (!config) return null;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        colorClasses[config.color],
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'
      )}
    >
      <span className="mr-1">{config.emoji}</span>
      {t(config.labelKey)}
    </Badge>
  );
}
