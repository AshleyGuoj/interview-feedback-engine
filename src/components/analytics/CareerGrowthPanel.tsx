import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { Job } from '@/types/job';
import { CareerGrowthAnalysis } from '@/types/career-growth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CompetencyLineChart } from './charts/CompetencyLineChart';
import { CompetencyRadarChart } from './charts/CompetencyRadarChart';
import { StrengthsGapsChart } from './charts/StrengthsGapsChart';

interface CareerGrowthPanelProps {
  jobs: Job[];
}

export function CareerGrowthPanel({ jobs }: CareerGrowthPanelProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [analysis, setAnalysis] = useState<CareerGrowthAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Collect all analyzed rounds across all jobs
  const allAnalyzedRounds = useMemo(() => {
    const rounds: Array<{
      roundDate: string;
      jobId: string;
      companyName: string;
      roleTitle: string;
      stageName: string;
      questions: Array<{
        category: string;
        responseQuality: 'high' | 'medium' | 'low';
        difficulty: number;
        tags?: string[];
      }>;
      reflection?: {
        overallFeeling: string;
        whatWentWell: string[];
        whatCouldImprove: string[];
        keyTakeaways: string[];
      };
    }> = [];

    jobs.forEach(job => {
      job.stages.forEach(stage => {
        if (stage.status === 'completed' && (stage.questions?.length || stage.reflection)) {
          const roundDate = stage.scheduledTime || stage.date || job.createdAt;
          
          rounds.push({
            roundDate,
            jobId: job.id,
            companyName: job.companyName,
            roleTitle: job.roleTitle,
            stageName: stage.name,
            questions: stage.questions?.map(q => ({
              category: q.category,
              responseQuality: q.answeredWell === true ? 'high' : q.answeredWell === false ? 'low' : 'medium',
              difficulty: q.difficulty,
              tags: q.tags,
            })) || [],
            reflection: stage.reflection ? {
              overallFeeling: stage.reflection.overallFeeling,
              whatWentWell: stage.reflection.whatWentWell || [],
              whatCouldImprove: stage.reflection.whatCouldImprove || [],
              keyTakeaways: stage.reflection.keyTakeaways || [],
            } : undefined,
          });
        }
      });
    });

    // Sort by date
    return rounds.sort((a, b) => new Date(a.roundDate).getTime() - new Date(b.roundDate).getTime());
  }, [jobs]);

  const canGenerate = allAnalyzedRounds.length >= 2;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-career-growth', {
        body: { rounds: allAnalyzedRounds, language },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setAnalysis(data as CareerGrowthAnalysis);
      toast.success(t('careerGrowth.analysisSuccess'));
    } catch (err) {
      console.error('Error generating career growth analysis:', err);
      setError(err instanceof Error ? err.message : t('careerGrowth.analysisFailed'));
      toast.error(t('careerGrowth.analysisFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'improving':
        return t('careerGrowth.improving');
      case 'declining':
        return t('careerGrowth.declining');
      default:
        return t('careerGrowth.stable');
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'high':
        return t('careerGrowth.highImpact');
      case 'medium':
        return t('careerGrowth.mediumImpact');
      default:
        return t('careerGrowth.lowImpact');
    }
  };

  // Empty state
  if (!analysis && !isGenerating) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <LineChartIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">{t('careerGrowth.title')}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t('careerGrowth.analysisDescription')}
          </p>
          
          <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left">
            <p className="text-sm font-medium mb-2">
              {t('careerGrowth.availableData')}: {allAnalyzedRounds.length} {t('careerGrowth.interviewRounds')}
            </p>
            {allAnalyzedRounds.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {allAnalyzedRounds.slice(0, 5).map((round, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">{round.companyName}</span>
                    <span>·</span>
                    <span>{round.stageName}</span>
                    <span>·</span>
                    <span>{format(new Date(round.roundDate), 'yyyy-MM')}</span>
                  </div>
                ))}
                {allAnalyzedRounds.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    {t('careerGrowth.andMore', { count: allAnalyzedRounds.length - 5 })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('careerGrowth.noAnalyzedData')}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={!canGenerate || isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('careerGrowth.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('careerGrowth.generateGrowthAnalysis')}
              </>
            )}
          </Button>

          {!canGenerate && (
            <p className="text-xs text-muted-foreground mt-3">
              {t('careerGrowth.needsMinRounds')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {t('careerGrowth.analyzingProgress', { count: allAnalyzedRounds.length })}
          </p>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t('careerGrowth.title')}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {analysis?.timelineOverview.timeRange || '-'}
              <span className="text-muted-foreground">·</span>
              {analysis?.timelineOverview.totalInterviews || 0} {t('careerGrowth.interviewRounds')}
              <span className="text-muted-foreground">·</span>
              {analysis?.timelineOverview.rolesCovered?.length || 0} {t('careerGrowth.positions')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
            {t('common.regenerate')}
          </Button>
        </div>

        {/* Coach Message Hero */}
        {analysis?.coachMessage && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t('careerGrowth.coachMessage')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.coachMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insight Summary Cards */}
        {analysis?.insightSummary && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                  <ArrowUpRight className="w-4 h-4" />
                  {t('careerGrowth.biggestChange')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{analysis.insightSummary.biggestPositiveChange}</p>
                {analysis.insightSummary.keyImprovements?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {analysis.insightSummary.keyImprovements.map((item, i) => (
                      <li key={i} className="text-xs text-emerald-600 flex gap-1.5">
                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                  <ArrowDownRight className="w-4 h-4" />
                  {t('careerGrowth.biggestRisk')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{analysis.insightSummary.biggestUnresolvedRisk}</p>
                {analysis.insightSummary.persistentGaps?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {analysis.insightSummary.persistentGaps.map((item, i) => (
                      <li key={i} className="text-xs text-amber-600 flex gap-1.5">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Competency Line Chart */}
        {analysis?.visualizationData?.lineChart && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-primary" />
                {t('careerGrowth.trendChart')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompetencyLineChart data={analysis.visualizationData.lineChart} />
            </CardContent>
          </Card>
        )}

        {/* Radar Chart: Past vs Current */}
        {analysis?.visualizationData?.radarChart && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {t('careerGrowth.radarComparison')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompetencyRadarChart data={analysis.visualizationData.radarChart} />
            </CardContent>
          </Card>
        )}

        {/* Strengths vs Gaps Bar Chart */}
        {analysis?.visualizationData?.barChart && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                {t('careerGrowth.strengthsVsGaps')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StrengthsGapsChart data={analysis.visualizationData.barChart} />
            </CardContent>
          </Card>
        )}

        {/* Competency Trends Table */}
        {analysis?.competencyTrends && analysis.competencyTrends.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t('careerGrowth.trendDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.competencyTrends.map((trend, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "p-4 rounded-lg border",
                      getTrendColor(trend.trend)
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend)}
                        <span className="font-medium">{trend.competency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getTrendLabel(trend.trend)}
                        </Badge>
                        <span className="text-sm font-medium">
                          {trend.delta > 0 ? '+' : ''}{trend.delta.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm opacity-80">{trend.interpretation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Growth Priorities */}
        {analysis?.nextGrowthPriorities && analysis.nextGrowthPriorities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {t('careerGrowth.nextPriorities')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.nextGrowthPriorities.map((priority, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      priority.expectedImpact === 'high' ? 'bg-red-100 text-red-700' :
                      priority.expectedImpact === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{priority.focusArea}</p>
                      <p className="text-xs text-muted-foreground mt-1">{priority.reason}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {getImpactLabel(priority.expectedImpact)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stable Advantages */}
        {analysis?.insightSummary?.stableAdvantages?.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                {t('careerGrowth.stableAdvantages')} ({t('careerGrowth.keepingStrong')})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.insightSummary.stableAdvantages.map((item, i) => (
                  <Badge key={i} variant="secondary" className="text-blue-700 bg-blue-100">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
