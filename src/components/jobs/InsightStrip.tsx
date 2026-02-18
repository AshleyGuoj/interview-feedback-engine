import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Job, JobStatus, InterviewingSubStatus, OfferSubStatus, ClosedReason } from '@/types/job';
import { cn } from '@/lib/utils';
import { 
  CalendarCheck, Clock, AlertCircle, UserCheck, BookOpen, 
  MessageSquare, Mail, Handshake, XCircle, FileText, 
  Moon, RotateCcw, Ban, UserX, type LucideIcon
} from 'lucide-react';

interface InsightStripProps {
  status: JobStatus;
  jobs: Job[];
}

type SubStatusCount = {
  key: string;
  icon: LucideIcon;
  labelKey: string;
  count: number;
  active: boolean; // true = primary tint, false = muted
};

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

const CLOSED_REASON_I18N: Record<ClosedReason, { labelKey: string; icon: LucideIcon; active: boolean }> = {
  rejected_after_interview: { labelKey: 'jobs.closedRejected', icon: XCircle, active: false },
  rejected_resume: { labelKey: 'jobs.closedResumeRejected', icon: FileText, active: false },
  no_response: { labelKey: 'jobs.closedNoResponse', icon: Moon, active: false },
  withdrawn: { labelKey: 'jobs.closedWithdrawn', icon: RotateCcw, active: false },
  hc_frozen: { labelKey: 'jobs.closedHcFrozen', icon: Ban, active: false },
  position_cancelled: { labelKey: 'jobs.closedCancelled', icon: XCircle, active: false },
  offer_declined: { labelKey: 'jobs.closedDeclinedOffer', icon: UserX, active: false },
};

export function InsightStrip({ status, jobs }: InsightStripProps) {
  const { t } = useTranslation();
  
  const insights = useMemo(() => {
    if (jobs.length === 0) return [];

    if (status === 'interviewing') {
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
            icon: config?.icon || Clock,
            labelKey: config?.labelKey || key,
            count,
            active: config?.active ?? true,
          };
        })
        .sort((a, b) => b.count - a.count);
    }

    if (status === 'offer') {
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
            icon: config?.icon || Clock,
            labelKey: config?.labelKey || key,
            count,
            active: config?.active ?? true,
          };
        })
        .sort((a, b) => b.count - a.count);
    }

    if (status === 'closed') {
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
            icon: config?.icon || Clock,
            labelKey: config?.labelKey || key,
            count,
            active: config?.active ?? false,
          };
        })
        .sort((a, b) => b.count - a.count);
    }

    return [];
  }, [status, jobs]);

  if (insights.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
      {insights.slice(0, 4).map((insight) => {
        const Icon = insight.icon;
        return (
          <span 
            key={insight.key} 
            className={cn(
              'flex items-center gap-0.5',
              insight.active ? 'text-primary/70' : 'text-muted-foreground'
            )}
          >
            <Icon className="w-3 h-3" />
            <span className="font-medium">{insight.count}</span>
            <span className="text-muted-foreground hidden sm:inline">{t(insight.labelKey)}</span>
          </span>
        );
      })}
    </div>
  );
}
