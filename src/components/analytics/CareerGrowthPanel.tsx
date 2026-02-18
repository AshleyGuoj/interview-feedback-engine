import { useState, useMemo, useEffect } from 'react';
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
  FileSearch,
  Brain,
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
      // Collect all stages from both top-level and pipelines, deduplicate by id
      const seenIds = new Set<string>();
      const allStages: typeof job.stages = [];
      
      const addStages = (stages: typeof job.stages) => {
        stages.forEach(stage => {
          if (!seenIds.has(stage.id)) {
            seenIds.add(stage.id);
            allStages.push(stage);
          }
        });
      };
      
      if (job.stages) addStages(job.stages);
      if (job.pipelines) {
        job.pipelines.forEach(p => {
          if (p.stages) addStages(p.stages);
        });
      }
      
      allStages.forEach(stage => {
        // Check for data presence instead of status
        if (stage.questions?.length || stage.reflection) {
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
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-primary bg-primary/5 border-primary/20';
      case 'declining':
        return 'text-destructive bg-destructive/5 border-destructive/20';
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

  // Loading steps for card animation
  const loadingSteps = useMemo(() => [
    { icon: FileSearch, key: 'loading_collectData' },
    { icon: Brain, key: 'loading_analyzeTrends' },
    { icon: TrendingUp, key: 'loading_mapGrowth' },
    { icon: Sparkles, key: 'loading_composeInsights' },
  ], []);

  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating, loadingSteps.length]);

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
      <div className="h-full flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border border-border bg-card py-16 px-8">
          <div className="flex flex-col items-center gap-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LineChartIcon className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">
                {t('careerGrowth.loadingTitle')}
              </h3>
            </div>

            {/* Step Cards */}
            <div className="grid grid-cols-4 gap-3 w-full">
              {loadingSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === loadingStep;
                const isComplete = index < loadingStep;

                return (
                  <div
                    key={step.key}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-500",
                      isActive
                        ? "bg-primary/10 border-primary/30 text-primary scale-105 shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                        : isComplete
                        ? "bg-muted/50 border-border text-muted-foreground"
                        : "bg-muted/20 border-transparent text-muted-foreground/40"
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn("w-5 h-5", isActive && "animate-bounce")} />
                      {isComplete && (
                        <CheckCircle2 className="w-3 h-3 text-primary absolute -top-1 -right-1" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">
                      {t(`careerGrowth.${step.key}`)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-3">
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/40 rounded-full transition-all duration-500"
                  style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>
              <p className="text-[12px] text-muted-foreground/60 text-center">
                {t('careerGrowth.loadingHint')}
              </p>
            </div>
          </div>
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

        {/* Insight Summary — single card, split view */}
        {analysis?.insightSummary && (
          <Card>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-x divide-border">
                <div className="p-5">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-primary mb-3">
                    <ArrowUpRight className="w-4 h-4" />
                    {t('careerGrowth.biggestChange')}
                  </h4>
                  <p className="text-sm font-medium">{analysis.insightSummary.biggestPositiveChange}</p>
                  {analysis.insightSummary.keyImprovements?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {analysis.insightSummary.keyImprovements.map((item, i) => (
                        <li key={i} className="text-xs text-primary/80 flex gap-1.5">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="p-5">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground mb-3">
                    <ArrowDownRight className="w-4 h-4" />
                    {t('careerGrowth.biggestRisk')}
                  </h4>
                  <p className="text-sm font-medium">{analysis.insightSummary.biggestUnresolvedRisk}</p>
                  {analysis.insightSummary.persistentGaps?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {analysis.insightSummary.persistentGaps.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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

        {/* Competency Trends — Open Section */}
        {analysis?.competencyTrends && analysis.competencyTrends.length > 0 && (
          <div className="border-l-2 border-l-primary/30 pl-5 space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {t('careerGrowth.trendDetails')}
            </h3>
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
          </div>
        )}

        {/* Next Growth Priorities — Open Section */}
        {analysis?.nextGrowthPriorities && analysis.nextGrowthPriorities.length > 0 && (
          <div className="border-l-2 border-l-muted-foreground/30 pl-5 space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              {t('careerGrowth.nextPriorities')}
            </h3>
            <div className="space-y-3">
              {analysis.nextGrowthPriorities.map((priority, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/10 text-primary">
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
          </div>
        )}

        {/* Stable Advantages — Inline badges */}
        {analysis?.insightSummary?.stableAdvantages?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-4 h-4" />
              {t('careerGrowth.stableAdvantages')} ({t('careerGrowth.keepingStrong')})
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.insightSummary.stableAdvantages.map((item, i) => (
                <Badge key={i} variant="default">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
