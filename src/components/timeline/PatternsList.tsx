import { CareerPattern, RISK_LEVEL_CONFIG } from '@/types/career-signals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatternsListProps {
  patterns: CareerPattern[];
}

const riskIconMap = {
  low: CheckCircle2,
  medium: AlertCircle,
  high: AlertTriangle,
};

export function PatternsList({ patterns }: PatternsListProps) {
  if (patterns.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Radar className="w-4 h-4 text-primary" />
          发现的模式
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.map((pattern, index) => {
          const config = RISK_LEVEL_CONFIG[pattern.riskLevel];
          const RiskIcon = riskIconMap[pattern.riskLevel];
          
          return (
            <div 
              key={index}
              className={cn(
                'p-3 rounded-lg border',
                pattern.riskLevel === 'high' && 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
                pattern.riskLevel === 'medium' && 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20',
                pattern.riskLevel === 'low' && 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20',
              )}
            >
              <div className="flex items-start gap-2">
                <RiskIcon className={cn('w-4 h-4 mt-0.5 shrink-0', config.color)} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{pattern.pattern}</span>
                    <Badge variant="outline" className={cn('text-xs', config.color)}>
                      风险: {config.labelZh}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pattern.evidence}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
