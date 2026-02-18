import { useTranslation } from 'react-i18next';
import { CareerPattern } from '@/types/career-signals';
import { cn } from '@/lib/utils';

interface PatternsListProps {
  patterns: CareerPattern[];
}

export function PatternsList({ patterns }: PatternsListProps) {
  const { t } = useTranslation();

  const getRiskLabel = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return t('timeline.riskLow');
      case 'medium': return t('timeline.riskMedium');
      case 'high': return t('timeline.riskHigh');
      default: return riskLevel;
    }
  };

  const getRiskPillStyle = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'text-success bg-success/8';
      case 'medium': return 'text-warning bg-warning/8';
      case 'high': return 'text-destructive bg-destructive/8';
    }
  };

  if (patterns.length === 0) return null;

  return (
    <div className="rounded-2xl surface-elevated border border-border p-5 sm:p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-semibold text-foreground">
          {t('timeline.patternsDiscovered')}
        </h3>
        <span className="text-[12px] text-muted-foreground/60">
          {patterns.length} {patterns.length === 1 ? 'insight' : 'insights'}
        </span>
      </div>

      <div className="divide-y divide-border">
        {patterns.map((pattern, index) => (
          <div key={index} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0 mt-[8px]',
                pattern.riskLevel === 'high' && 'bg-destructive/50',
                pattern.riskLevel === 'medium' && 'bg-warning/50',
                pattern.riskLevel === 'low' && 'bg-success/50',
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-foreground leading-snug">
                  {pattern.pattern}
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">
                  {pattern.evidence}
                </p>
              </div>
            </div>
            <span className={cn(
              'text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0',
              getRiskPillStyle(pattern.riskLevel)
            )}>
              {getRiskLabel(pattern.riskLevel)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
