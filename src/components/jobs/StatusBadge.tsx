import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { 
  InterviewingSubStatus, 
  OfferSubStatus, 
  RiskTag, 
  ClosedReason,
} from '@/types/job';
import { cn } from '@/lib/utils';
import {
  CalendarCheck, Clock, AlertCircle, UserCheck, BookOpen,
  MessageSquare, Mail, Handshake, XCircle, FileText,
  Moon, RotateCcw, Ban, UserX, AlertTriangle, 
  RefreshCw, DollarSign, Timer, TrendingDown, type LucideIcon
} from 'lucide-react';

interface SubStatusBadgeProps {
  subStatus: InterviewingSubStatus | OfferSubStatus;
  size?: 'sm' | 'default';
}

const SUB_STATUS_I18N: Record<InterviewingSubStatus | OfferSubStatus, { labelKey: string; icon: LucideIcon; active: boolean }> = {
  interview_scheduled: { labelKey: 'jobs.subStatusScheduled', icon: CalendarCheck, active: true },
  feedback_pending: { labelKey: 'jobs.subStatusFeedbackPending', icon: Clock, active: true },
  approval_pending: { labelKey: 'jobs.subStatusApprovalPending', icon: AlertCircle, active: true },
  hr_followup: { labelKey: 'jobs.subStatusHrFollowup', icon: UserCheck, active: true },
  preparing: { labelKey: 'jobs.subStatusPreparing', icon: BookOpen, active: true },
  offer_discussion: { labelKey: 'jobs.subStatusDiscussing', icon: MessageSquare, active: true },
  offer_pending: { labelKey: 'jobs.subStatusOfferPending', icon: Clock, active: true },
  offer_received: { labelKey: 'jobs.subStatusOfferReceived', icon: Mail, active: true },
  negotiating: { labelKey: 'jobs.subStatusNegotiating', icon: Handshake, active: true },
};

export function SubStatusBadge({ subStatus, size = 'default' }: SubStatusBadgeProps) {
  const { t } = useTranslation();
  const config = SUB_STATUS_I18N[subStatus];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        config.active 
          ? 'bg-primary/10 text-primary' 
          : 'bg-muted text-muted-foreground',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'
      )}
    >
      <Icon className={cn('mr-1', size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
      {t(config.labelKey)}
    </Badge>
  );
}

interface RiskTagBadgeProps {
  tag: RiskTag;
  size?: 'sm' | 'default';
}

const RISK_TAG_I18N: Record<RiskTag, { labelKey: string; icon: LucideIcon }> = {
  hc_risk: { labelKey: 'jobs.riskHcRisk', icon: AlertTriangle },
  long_silence: { labelKey: 'jobs.riskLongSilence', icon: Clock },
  extra_round: { labelKey: 'jobs.riskExtraRound', icon: RefreshCw },
  competing_offer: { labelKey: 'jobs.riskCompetingOffer', icon: DollarSign },
  timeline_delay: { labelKey: 'jobs.riskDelayed', icon: Timer },
  salary_gap: { labelKey: 'jobs.riskSalaryGap', icon: DollarSign },
  lowball_offer: { labelKey: 'jobs.riskLowball', icon: TrendingDown },
};

export function RiskTagBadge({ tag, size = 'default' }: RiskTagBadgeProps) {
  const { t } = useTranslation();
  const config = RISK_TAG_I18N[tag];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'border-muted-foreground/30 text-muted-foreground',
        size === 'sm' ? 'text-[10px] px-1 py-0' : 'text-xs'
      )}
    >
      <Icon className={cn('mr-0.5', size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
      {size === 'default' && t(config.labelKey)}
    </Badge>
  );
}

interface ClosedReasonBadgeProps {
  reason: ClosedReason;
  size?: 'sm' | 'default';
}

const CLOSED_REASON_I18N: Record<ClosedReason, { labelKey: string; icon: LucideIcon }> = {
  rejected_after_interview: { labelKey: 'jobs.closedRejected', icon: XCircle },
  rejected_resume: { labelKey: 'jobs.closedResumeRejected', icon: FileText },
  no_response: { labelKey: 'jobs.closedNoResponse', icon: Moon },
  withdrawn: { labelKey: 'jobs.closedWithdrawn', icon: RotateCcw },
  hc_frozen: { labelKey: 'jobs.closedHcFrozen', icon: Ban },
  position_cancelled: { labelKey: 'jobs.closedCancelled', icon: XCircle },
  offer_declined: { labelKey: 'jobs.closedDeclinedOffer', icon: UserX },
};

export function ClosedReasonBadge({ reason, size = 'default' }: ClosedReasonBadgeProps) {
  const { t } = useTranslation();
  const config = CLOSED_REASON_I18N[reason];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        'bg-muted/50 text-muted-foreground',
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'
      )}
    >
      <Icon className={cn('mr-1', size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
      {t(config.labelKey)}
    </Badge>
  );
}
