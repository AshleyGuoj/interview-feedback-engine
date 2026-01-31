import { Badge } from '@/components/ui/badge';
import { 
  InterviewingSubStatus, 
  OfferSubStatus, 
  RiskTag, 
  ClosedReason,
  SUB_STATUS_CONFIG,
  RISK_TAG_CONFIG,
  CLOSED_REASON_CONFIG 
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

export function SubStatusBadge({ subStatus, size = 'default' }: SubStatusBadgeProps) {
  const config = SUB_STATUS_CONFIG[subStatus];
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
      {config.label}
    </Badge>
  );
}

interface RiskTagBadgeProps {
  tag: RiskTag;
  size?: 'sm' | 'default';
}

export function RiskTagBadge({ tag, size = 'default' }: RiskTagBadgeProps) {
  const config = RISK_TAG_CONFIG[tag];
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
      {size === 'default' && config.label}
    </Badge>
  );
}

interface ClosedReasonBadgeProps {
  reason: ClosedReason;
  size?: 'sm' | 'default';
}

export function ClosedReasonBadge({ reason, size = 'default' }: ClosedReasonBadgeProps) {
  const config = CLOSED_REASON_CONFIG[reason];
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
      {config.label}
    </Badge>
  );
}
