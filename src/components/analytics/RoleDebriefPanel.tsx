import { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { RoleDebrief, COMPETENCY_CONFIG, HIRING_LIKELIHOOD_CONFIG, CompetencyKey } from '@/types/role-debrief';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
  Lightbulb,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RoleDebriefPanelProps {
  job: Job;
}

export function RoleDebriefPanel({ job }: RoleDebriefPanelProps) {
  const [debrief, setDebrief] = useState<RoleDebrief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get rounds with analysis data
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
        },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setDebrief(data as RoleDebrief);
      toast.success('Role Debrief 生成成功');
    } catch (err) {
      console.error('Error generating debrief:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      toast.error('生成失败，请重试');
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
          <h2 className="text-lg font-semibold mb-2">Role Debrief 岗位复盘</h2>
          <p className="text-sm text-muted-foreground mb-4">
            聚合分析所有面试轮次，生成面试官矩阵、能力热力图和录用可能性评估
          </p>
          
          <div className="mb-6 p-4 bg-muted/50 rounded-lg text-left">
            <p className="text-sm font-medium mb-2">已分析的轮次 ({analyzedRounds.length}):</p>
            {analyzedRounds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analyzedRounds.map(s => (
                  <Badge key={s.id} variant="secondary" className="text-xs">
                    {s.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无已分析的轮次</p>
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
                正在生成...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                生成 Role Debrief
              </>
            )}
          </Button>

          {!canGenerate && (
            <p className="text-xs text-muted-foreground mt-3">
              请先完成至少1轮面试的 AI 分析
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
          <p className="text-sm text-muted-foreground">正在聚合分析 {analyzedRounds.length} 轮面试数据...</p>
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
            <h2 className="text-lg font-semibold">{job.companyName} · {job.roleTitle}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              生成于 {debrief ? format(new Date(debrief.generatedAt), 'yyyy/MM/dd HH:mm') : '-'}
              <span className="text-muted-foreground">·</span>
              基于 {debrief?.roundCount || 0} 轮分析
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
            重新生成
          </Button>
        </div>

        {/* Hiring Likelihood Hero Card */}
        {debrief && (
          <Card className={cn(
            "border-2",
            HIRING_LIKELIHOOD_CONFIG[debrief.hiringLikelihood.level].color
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{HIRING_LIKELIHOOD_CONFIG[debrief.hiringLikelihood.level].emoji}</span>
                    <h3 className="text-xl font-bold">
                      录用可能性: {debrief.hiringLikelihood.level === 'High' ? '高' : debrief.hiringLikelihood.level === 'Medium' ? '中' : '低'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">置信度:</span>
                    <Progress value={debrief.hiringLikelihood.confidence * 100} className="w-24 h-2" />
                    <span className="text-sm font-medium">{Math.round(debrief.hiringLikelihood.confidence * 100)}%</span>
                  </div>
                  <ul className="space-y-1.5">
                    {debrief.hiringLikelihood.reasons.map((reason, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {debrief.roleSummary && (
                <p className="mt-4 pt-4 border-t text-sm text-muted-foreground italic">
                  {debrief.roleSummary}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interviewer Mapping Table */}
        {debrief && debrief.interviewerMapping?.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                面试官关注点矩阵
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">轮次</th>
                      <th className="text-left py-2 px-3 font-medium">面试官背景</th>
                      <th className="text-left py-2 px-3 font-medium">关注维度</th>
                      <th className="text-left py-2 px-3 font-medium">高光点</th>
                      <th className="text-left py-2 px-3 font-medium">风险点</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debrief.interviewerMapping.map((row, i) => (
                      <tr key={row.roundId} className={cn(i % 2 === 0 && "bg-muted/30")}>
                        <td className="py-2 px-3 font-medium">{row.roundName}</td>
                        <td className="py-2 px-3">{row.interviewerBackground}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1 flex-wrap">
                            {row.focusDimensions.map((d, di) => (
                              <Badge key={di} variant="outline" className="text-xs">{d}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-emerald-600 flex items-start gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            {row.highlight}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-amber-600 flex items-start gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
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

        {/* Competency Heatmap */}
        {debrief && debrief.competencyHeatmap && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                能力热力图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(debrief.competencyHeatmap).map(([key, value]) => {
                  const config = COMPETENCY_CONFIG[key as CompetencyKey];
                  if (!config || !value) return null;
                  
                  const score = value.score || 0;
                  const scoreColor = score >= 4 ? 'text-emerald-600 bg-emerald-50' 
                    : score >= 3 ? 'text-amber-600 bg-amber-50'
                    : 'text-red-600 bg-red-50';

                  return (
                    <div key={key} className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{config.icon}</span>
                        <span className="text-xs font-medium truncate">{config.labelZh}</span>
                      </div>
                      <div className={cn("text-2xl font-bold rounded px-2 py-1 w-fit", scoreColor)}>
                        {score}/5
                      </div>
                      {value.evidence && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {value.evidence}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Insights */}
        {debrief && debrief.keyInsights && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                  <Target className="w-4 h-4" />
                  公司最看重
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {debrief.keyInsights.careMost?.map((item, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-blue-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  你的优势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {debrief.keyInsights.strengths?.map((item, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  待改进风险
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {debrief.keyInsights.risks?.map((item, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-amber-500">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Next Best Actions */}
        {debrief && debrief.nextBestActions?.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                下一步行动建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debrief.nextBestActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      action.priority === 'high' ? 'bg-red-100 text-red-700' :
                      action.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    )}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.action}</p>
                      {action.targetGap && (
                        <p className="text-xs text-muted-foreground mt-1">
                          针对: {action.targetGap}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {action.priority === 'high' ? '高优先' : action.priority === 'medium' ? '中优先' : '低优先'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
