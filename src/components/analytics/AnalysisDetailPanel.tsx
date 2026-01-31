import { useState } from 'react';
import { Job, InterviewStage, InterviewQuestion, InterviewReflection, QUESTION_CATEGORIES } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Building2,
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  Lightbulb,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  Download,
  FileDown,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  TranscriptAnalysisResult,
  ExtractedQuestion,
  ExtractedReflection,
} from '@/types/transcript-analysis';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TranscriptInput } from '@/components/interview/TranscriptInput';

const QUALITY_CONFIG = {
  high: { label: '回答优秀', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  medium: { label: '回答一般', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertCircle },
  low: { label: '需要改进', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle },
};

const FEELING_CONFIG = {
  great: { label: '非常好', emoji: '🎉', color: 'text-emerald-600' },
  good: { label: '还不错', emoji: '😊', color: 'text-green-600' },
  neutral: { label: '一般般', emoji: '😐', color: 'text-gray-600' },
  poor: { label: '不太好', emoji: '😔', color: 'text-orange-600' },
  bad: { label: '很糟糕', emoji: '😢', color: 'text-red-600' },
};

interface AnalysisDetailPanelProps {
  job: Job;
  stage: InterviewStage;
  onSave: (questions: InterviewQuestion[], reflection: InterviewReflection) => Promise<void>;
}

export function AnalysisDetailPanel({ job, stage, onSave }: AnalysisDetailPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TranscriptAnalysisResult | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const hasExistingAnalysis = (stage.questions?.length || 0) > 0 || !!stage.reflection;

  const handleAnalyze = async (transcript: string) => {
    if (!transcript.trim() || transcript.length < 50) {
      toast.error('请输入更详细的面试记录（至少50个字符）');
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-transcript', {
        body: {
          transcript,
          context: {
            company: job.companyName,
            role: job.roleTitle,
            stage: stage.name,
          },
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast.success(`成功提取 ${data.questions.length} 个问题和完整复盘`);
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      toast.error(error instanceof Error ? error.message : '分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleSaveAll = async () => {
    if (!result) return;

    setIsSaving(true);

    try {
      const newQuestions: InterviewQuestion[] = result.questions.map((q, index) => ({
        id: `extracted-${Date.now()}-${index}`,
        question: q.question,
        category: q.category,
        myAnswer: q.myAnswerSummary,
        difficulty: q.difficulty,
        wasAsked: true,
        answeredWell: q.responseQuality === 'high',
        tags: q.tags,
      }));

      const newReflection: InterviewReflection = {
        overallFeeling: result.reflection.overallFeeling,
        whatWentWell: result.reflection.whatWentWell,
        whatCouldImprove: result.reflection.whatCouldImprove,
        keyTakeaways: result.reflection.keyTakeaways,
        interviewerVibe: result.reflection.interviewerVibe,
        companyInsights: result.reflection.companyInsights,
      };

      await onSave(newQuestions, newReflection);
      toast.success('已保存分析结果');
      setResult(null);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // Show existing analysis if available
  if (hasExistingAnalysis && !result) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{job.companyName}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{job.roleTitle}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5">
                <Calendar className="w-3 h-3" />
                {stage.name}
              </Badge>
              {stage.scheduledTime && (
                <Badge variant="secondary" className="gap-1.5">
                  <Clock className="w-3 h-3" />
                  {format(new Date(stage.scheduledTime), 'yyyy/MM/dd HH:mm')}
                </Badge>
              )}
              <Badge className="bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                已分析
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Existing Questions */}
          {stage.questions && stage.questions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">面试问题记录</h2>
                  <p className="text-sm text-muted-foreground">
                    共 {stage.questions.length} 个问题
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {stage.questions.map((q, index) => (
                  <Card key={q.id} className="overflow-hidden">
                    <div className="flex items-start gap-3 p-4">
                      <span className="text-sm font-medium text-muted-foreground w-8 shrink-0">
                        Q{index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{q.question}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {QUESTION_CATEGORIES[q.category]?.label || q.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            难度 {q.difficulty}/5
                          </span>
                          {q.answeredWell === true && (
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          {q.answeredWell === false && (
                            <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                        {q.myAnswer && (
                          <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                            {q.myAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Existing Reflection */}
          {stage.reflection && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">面试复盘</h2>
                  <p className="text-sm text-muted-foreground">
                    {FEELING_CONFIG[stage.reflection.overallFeeling]?.emoji} {FEELING_CONFIG[stage.reflection.overallFeeling]?.label}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {stage.reflection.whatWentWell?.length > 0 && (
                  <Card className="border-emerald-200 bg-emerald-50/30">
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        表现好的地方
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1.5">
                        {stage.reflection.whatWentWell.map((item, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-emerald-500">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {stage.reflection.whatCouldImprove?.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50/30">
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        可以改进的地方
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1.5">
                        {stage.reflection.whatCouldImprove.map((item, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-amber-500">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {stage.reflection.keyTakeaways?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        核心收获
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {stage.reflection.keyTakeaways.map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {stage.reflection.interviewerVibe && (
                  <Card>
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-semibold">面试官风格</h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{stage.reflection.interviewerVibe}</p>
                    </CardContent>
                  </Card>
                )}

                {stage.reflection.companyInsights && (
                  <Card>
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-semibold">公司洞察</h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{stage.reflection.companyInsights}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          )}

          {/* Re-analyze button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              重新分析
            </Button>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Show input for new analysis or re-analysis
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{job.companyName}</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span>{job.roleTitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5">
              <Calendar className="w-3 h-3" />
              {stage.name}
            </Badge>
            {stage.scheduledTime && (
              <Badge variant="secondary" className="gap-1.5">
                <Clock className="w-3 h-3" />
                {format(new Date(stage.scheduledTime), 'yyyy/MM/dd HH:mm')}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {!result ? (
          /* Input Section */
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">输入面试记录</h2>
                <p className="text-sm text-muted-foreground">
                  支持粘贴任意形式的面试记录或上传文件，AI 将自动提取问题并生成复盘
                </p>
              </div>
            </div>

            <TranscriptInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </section>
        ) : (
          /* Results Section */
          <>
            {/* Metadata summary */}
            <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-muted/50 border">
              <Badge variant="outline" className="gap-1.5">
                <MessageSquare className="w-3 h-3" />
                共 {result.metadata.totalQuestions} 个问题
              </Badge>
              <Badge variant="outline">主要类型: {result.metadata.dominantCategory}</Badge>
              <Badge variant="outline">难度: {result.metadata.overallDifficulty}</Badge>
              <Badge variant="outline">语言: {result.metadata.languageDetected}</Badge>
            </div>

            {/* Extracted Questions */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">提取的面试问题</h2>
                  <p className="text-sm text-muted-foreground">
                    AI 从记录中识别出 {result.questions.length} 个问题
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {result.questions.map((q, index) => (
                  <QuestionCard
                    key={index}
                    question={q}
                    index={index}
                    isExpanded={expandedQuestions.has(index)}
                    onToggle={() => toggleQuestion(index)}
                  />
                ))}
              </div>
            </section>

            {/* Detailed Reflection */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">面试复盘分析</h2>
                  <p className="text-sm text-muted-foreground">基于你的面试记录生成的详细复盘</p>
                </div>
              </div>

              <ReflectionDisplay reflection={result.reflection} />
            </section>

            {/* Save Actions */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t py-4 -mx-6 px-6 mt-6">
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setResult(null)}>
                  重新分析
                </Button>
                <Button onClick={handleSaveAll} disabled={isSaving} className="gap-2" size="lg">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存分析结果
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}

// Question card component
function QuestionCard({
  question,
  index,
  isExpanded,
  onToggle,
}: {
  question: ExtractedQuestion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const categoryConfig = QUESTION_CATEGORIES[question.category];
  const qualityConfig = QUALITY_CONFIG[question.responseQuality];
  const QualityIcon = qualityConfig.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors text-left">
            <span className="text-sm font-medium text-muted-foreground w-8 shrink-0">Q{index + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{question.question}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {categoryConfig?.label || question.category}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', qualityConfig.color)}>
                  <QualityIcon className="w-3 h-3 mr-1" />
                  {qualityConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">难度 {question.difficulty}/5</span>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 space-y-3 border-t bg-muted/30 ml-8">
            <div className="pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">我的回答概要</p>
              <p className="text-sm">{question.myAnswerSummary}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">考察重点</p>
              <p className="text-sm">{question.evaluationFocus}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">评价说明</p>
              <p className="text-sm text-muted-foreground">{question.qualityReasoning}</p>
            </div>
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {question.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Reflection display component
function ReflectionDisplay({ reflection }: { reflection: ExtractedReflection }) {
  return (
    <div className="space-y-4">
      {/* Overall assessment */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</span>
            整体评估
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.performanceSummary}</p>
        </CardContent>
      </Card>

      {/* What went well */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-emerald-700">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">2</span>
            <CheckCircle2 className="w-4 h-4" />
            表现好的地方
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {reflection.whatWentWell.map((item, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-emerald-500 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* What could improve */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-700">
            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">3</span>
            <AlertCircle className="w-4 h-4" />
            可以改进的地方
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {reflection.whatCouldImprove.map((item, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-amber-500 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Key takeaways */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">4</span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
            核心收获
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {reflection.keyTakeaways.map((item, i) => (
              <Badge key={i} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interviewer vibe */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">5</span>
            面试官风格与关注点
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.interviewerVibe}</p>
        </CardContent>
      </Card>

      {/* Company insights */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">6</span>
            公司 & 职位洞察
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.companyInsights}</p>
        </CardContent>
      </Card>
    </div>
  );
}
