import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Job } from '@/types/job';
import { RoleDebrief, COMPETENCY_CONFIG, HIRING_LIKELIHOOD_CONFIG, CompetencyKey } from '@/types/role-debrief';
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
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Clock,
  ChevronRight,
  Crosshair,
  Zap,
  BarChart3,
  MessageSquare,
  Wrench,
  Brain,
  Blocks,
  Crown,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/useLanguage';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Crosshair, Zap, BarChart3, MessageSquare, Wrench, Brain, Blocks, TrendingUp, Crown, Shield,
  AlertTriangle, HelpCircle, CheckCircle2,
};

interface RoleDebriefPanelProps {
  job: Job;
}

// Score bar component
function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex gap-1 mt-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-4 rounded-full transition-colors",
            i <= score ? 'bg-primary' : 'bg-primary/10'
          )}
        />
      ))}
    </div>
  );
}

export function RoleDebriefPanel({ job }: RoleDebriefPanelProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [debrief, setDebrief] = useState<RoleDebrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzedRounds = job.stages.filter(
    s => s.status === 'completed' && (s.questions?.length || s.reflection)
  );

  const canGenerate = analyzedRounds.length >= 1;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);

    try {
      const roundsData = analyzedRounds.map(stage => ({
        roundId: stage.id,
        roundName: stage.name,
        questions: stage.questions?.map(q => ({
          question: q.question,
          category: q.category,
          myAnswerSummary: q.myAnswer,
          responseQuality: q.answeredWell === true ? 'high' : q.answeredWell === false ? 'low' : 'medium',
          difficulty: q.difficulty,
          tags: q.tags,
        })) || [],
        reflection: stage.reflection ? {
          overallFeeling: stage.reflection.overallFeeling,
          whatWentWell: stage.reflection.whatWentWell,
          whatCouldImprove: stage.reflection.whatCouldImprove,
          keyTakeaways: stage.reflection.keyTakeaways,
          interviewerVibe: stage.reflection.interviewerVibe,
          companyInsights: stage.reflection.companyInsights,
        } : undefined,
      }));

      const { data, error: fnError } = await supabase.functions.invoke('generate-role-debrief', {
        body: {
          jobId: job.id,
          companyName: job.companyName,
          roleTitle: job.roleTitle,
          rounds: roundsData,
          language,
        },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setDebrief(data as RoleDebrief);
      toast.success(t('roleDebriefPanel.generationSuccess'));
    } catch (err) {
      console.error('Error generating debrief:', err);
      setError(err instanceof Error ? err.message : t('roleDebriefPanel.generationFailed'));
      toast.error(t('roleDebriefPanel.generationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Empty state
  if (!debrief && !isGenerating) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">{t('roleDebriefPanel.title')}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t('roleDebriefPanel.subtitle')}
          </p>
          
          <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left">
            <p className="text-sm font-medium mb-2">{t('roleDebriefPanel.analyzedRounds')} ({analyzedRounds.length}):</p>
            {analyzedRounds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analyzedRounds.map(s => (
                  <Badge key={s.id} variant="secondary" className="text-xs">
                    {s.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('roleDebriefPanel.noAnalyzedRounds')}</p>
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
                {t('roleDebriefPanel.generating')}
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                {t('roleDebriefPanel.generateDebrief')}
              </>
            )}
          </Button>

          {!canGenerate && (
            <p className="text-xs text-muted-foreground mt-3">
              {t('roleDebriefPanel.requireMinRounds')}
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
          <p className="text-sm text-muted-foreground">{t('roleDebriefPanel.aggregatingAnalysis', { count: analyzedRounds.length })}</p>
        </div>
      </div>
    );
  }

  const likelihoodConfig = debrief ? HIRING_LIKELIHOOD_CONFIG[debrief.hiringLikelihood.level] : null;
  const LikelihoodIcon = likelihoodConfig ? ICON_MAP[likelihoodConfig.icon] : null;

  // Results view
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{job.companyName} · {job.roleTitle}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {t('roleDebriefPanel.generatedAt')} {debrief ? format(new Date(debrief.generatedAt), 'yyyy/MM/dd HH:mm') : '-'}
              <span className="text-muted-foreground">·</span>
              {t('roleDebriefPanel.basedOnRounds', { count: debrief?.roundCount || 0 })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
            {t('roleDebriefPanel.regenerate')}
          </Button>
        </div>

        {/* Hiring Likelihood — left accent card */}
        {debrief && (
          <div className={cn(
            "rounded-xl border-l-[3px] bg-muted/30 p-6",
            likelihoodConfig?.color
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  {LikelihoodIcon && <LikelihoodIcon className="w-5 h-5 text-primary" />}
                  <h3 className="text-xl font-bold text-foreground">
                    {t('roleDebriefPanel.hiringLikelihood')}: {debrief.hiringLikelihood.level === 'High' ? t('roleDebrief.high') : debrief.hiringLikelihood.level === 'Medium' ? t('roleDebrief.medium') : t('roleDebrief.low')}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">{t('roleDebriefPanel.confidence')}:</span>
                  <span className="text-sm font-semibold text-primary">{Math.round(debrief.hiringLikelihood.confidence * 100)}%</span>
                </div>
                <ul className="space-y-1.5">
                  {debrief.hiringLikelihood.reasons.map((reason, i) => (
                    <li key={i} className="text-sm flex gap-2 text-muted-foreground">
                      <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 text-primary/50" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {debrief.roleSummary && (
              <p className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground italic">
                {debrief.roleSummary}
              </p>
            )}
          </div>
        )}

        {/* Interviewer Mapping Table — keep Card */}
        {debrief && debrief.interviewerMapping?.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {t('roleDebriefPanel.interviewerMatrix')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">{t('roleDebriefPanel.round')}</th>
                      <th className="text-left py-2 px-3 font-medium">{t('roleDebriefPanel.interviewerBackground')}</th>
                      <th className="text-left py-2 px-3 font-medium">{t('roleDebriefPanel.focusDimensions')}</th>
                      <th className="text-left py-2 px-3 font-medium">{t('roleDebriefPanel.highlights')}</th>
                      <th className="text-left py-2 px-3 font-medium">{t('roleDebriefPanel.risks')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debrief.interviewerMapping.map((row, i) => (
                      <tr key={row.roundId} className={cn(i % 2 === 0 && "bg-muted/30")}>
                        <td className="py-2 px-3 font-medium">{row.roundName}</td>
                        <td className="py-2 px-3 text-muted-foreground">{row.interviewerBackground}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1 flex-wrap">
                            {row.focusDimensions.map((d, di) => (
                              <Badge key={di} variant="outline" className="text-xs">{d}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-foreground flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
                            {row.highlight}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-muted-foreground flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/40" />
                            {row.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Competency Heatmap — open section */}
        {debrief && debrief.competencyHeatmap && (
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold">{t('roleDebriefPanel.competencyHeatmap')}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(debrief.competencyHeatmap).map(([key, value]) => {
                const config = COMPETENCY_CONFIG[key as CompetencyKey];
                if (!config || !value) return null;
                
                const score = value.score || 0;
                const IconComp = ICON_MAP[config.icon];
                const competencyLabel = language === 'zh' ? config.labelZh : config.label;

                return (
                  <div key={key} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      {IconComp && <IconComp className="w-4 h-4 text-primary/60" />}
                      <span className="text-xs font-medium truncate">{competencyLabel}</span>
                    </div>
                    <p className="text-xl font-semibold text-primary">{score}/5</p>
                    <ScoreBar score={score} />
                    {value.evidence && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {value.evidence}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Insights — open sections with left border */}
        {debrief && debrief.keyInsights && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-l-2 border-l-primary/30 pl-4">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Target className="w-3.5 h-3.5 text-primary/60" />
                {t('roleDebriefPanel.whatTheyCareMost')}
              </h4>
              <ul className="space-y-1.5">
                {debrief.keyInsights.careMost?.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary/40">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-l-2 border-l-primary/30 pl-4">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary/60" />
                {t('roleDebriefPanel.yourStrengths')}
              </h4>
              <ul className="space-y-1.5">
                {debrief.keyInsights.strengths?.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary/40">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-l-2 border-l-primary/30 pl-4">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-primary/60" />
                {t('roleDebriefPanel.improvementRisks')}
              </h4>
              <ul className="space-y-1.5">
                {debrief.keyInsights.risks?.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-primary/40">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Next Best Actions — subtle bg block */}
        {debrief && debrief.nextBestActions?.length > 0 && (
          <div className="rounded-xl bg-muted/20 p-5">
            <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-primary/60" />
              {t('roleDebriefPanel.nextActions')}
            </h3>
            <div className="space-y-3">
              {debrief.nextBestActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/10 text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.action}</p>
                    {action.targetGap && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('roleDebriefPanel.targetingGap')}: {action.targetGap}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {action.priority === 'high' ? t('roleDebriefPanel.highPriority') : action.priority === 'medium' ? t('roleDebriefPanel.mediumPriority') : t('roleDebriefPanel.lowPriority')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
