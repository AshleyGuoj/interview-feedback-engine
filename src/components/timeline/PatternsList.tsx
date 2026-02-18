import { useTranslation } from 'react-i18next';
import { CareerPattern, RISK_LEVEL_CONFIG } from '@/types/career-signals';
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

  if (patterns.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
          {t('timeline.patternsDiscovered')}
        </h3>
      </div>
      <div className="px-5 pb-5 space-y-3">
        {patterns.map((pattern, index) => {
          const riskDot = cn(
            'w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]',
            pattern.riskLevel === 'high' && 'bg-destructive/60',
            pattern.riskLevel === 'medium' && 'bg-warning/60',
            pattern.riskLevel === 'low' && 'bg-success/60',
          );

          return (
            <div key={index} className="flex items-start gap-3 py-2">
              <div className={riskDot} />
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-medium text-foreground">
                    {pattern.pattern}
                  </span>
                  <span className="text-[11px] text-muted-foreground/60">
                    {getRiskLabel(pattern.riskLevel)}
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {pattern.evidence}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
