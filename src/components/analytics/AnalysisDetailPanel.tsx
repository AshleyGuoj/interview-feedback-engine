import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useLanguage } from '@/hooks/useLanguage';

const getQualityConfig = (t: (key: string) => string) => ({
  high: { label: t('analysisDetail.qualityHigh'), color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  medium: { label: t('analysisDetail.qualityMedium'), color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertCircle },
  low: { label: t('analysisDetail.qualityLow'), color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle },
});

const getFeelingConfig = (t: (key: string) => string) => ({
  great: { label: t('analysisDetail.feelingGreat'), emoji: '🎉', color: 'text-emerald-600' },
  good: { label: t('analysisDetail.feelingGood'), emoji: '😊', color: 'text-green-600' },
  neutral: { label: t('analysisDetail.feelingNeutral'), emoji: '😐', color: 'text-gray-600' },
  poor: { label: t('analysisDetail.feelingPoor'), emoji: '😔', color: 'text-orange-600' },
  bad: { label: t('analysisDetail.feelingBad'), emoji: '😢', color: 'text-red-600' },
});

interface AnalysisDetailPanelProps {
  job: Job;
  stage: InterviewStage;
  onSave: (questions: InterviewQuestion[], reflection: InterviewReflection) => Promise<void>;
}

export function AnalysisDetailPanel({ job, stage, onSave }: AnalysisDetailPanelProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TranscriptAnalysisResult | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const QUALITY_CONFIG = getQualityConfig(t);
  const FEELING_CONFIG = getFeelingConfig(t);

  const hasExistingAnalysis = (stage.questions?.length || 0) > 0 || !!stage.reflection;

  const handleAnalyze = async (transcript: string) => {
    if (!transcript.trim() || transcript.length < 50) {
      toast.error(t('transcriptInput.minCharsRequired'));
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
          language,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast.success(`${t('common.completed')} ${data.questions.length} ${t('transcriptInput.extractedQuestions')}`);
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      toast.error(error instanceof Error ? error.message : t('ai.analysisFailed'));
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
      toast.success(t('analysisDetail.savedSuccess'));
      setResult(null);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error(t('analysisDetail.saveFailed'));
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
                {t('analysisDetail.analyzed')}
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
                  <h2 className="text-lg font-semibold">{t('analysisDetail.interviewQuestions')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('common.completed')} {stage.questions.length} {t('analysisDetail.totalQuestions')}
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
                            {t(`questionCategory.${q.category}`)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {t('analysisDetail.difficulty')} {q.difficulty}/5
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
                  <h2 className="text-lg font-semibold">{t('analysisDetail.interviewDebrief')}</h2>
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
                        {t('analysisDetail.whatWentWell')}
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
                        {t('analysisDetail.whatCouldImprove')}
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
                        {t('analysisDetail.keyTakeaways')}
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
                      <h3 className="text-sm font-semibold">{t('analysisDetail.interviewerStyle')}</h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{stage.reflection.interviewerVibe}</p>
                    </CardContent>
                  </Card>
                )}

                {stage.reflection.companyInsights && (
                  <Card>
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-semibold">{t('analysisDetail.companyInsights')}</h3>
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
              {t('analysisDetail.reAnalyze')}
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
                <h2 className="text-lg font-semibold">{t('transcriptInput.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('transcriptInput.subtitle')}
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
                {result.metadata.totalQuestions} {t('analysisDetail.metadataQuestions')}
              </Badge>
              <Badge variant="outline">{t('analysisDetail.mainType')}: {result.metadata.dominantCategory}</Badge>
              <Badge variant="outline">{t('analysisDetail.difficultyLevel')}: {result.metadata.overallDifficulty}</Badge>
              <Badge variant="outline">{t('analysisDetail.language')}: {result.metadata.languageDetected}</Badge>
            </div>

            {/* Extracted Questions */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{t('analysisDetail.extractedQuestions')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('analysisDetail.aiExtracted', { count: result.questions.length })}
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
                    t={t}
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
                  <h2 className="text-lg font-semibold">{t('analysisDetail.interviewDebrief')}</h2>
                  <p className="text-sm text-muted-foreground">{t('transcriptInput.subtitle')}</p>
                </div>
              </div>

              <ReflectionDisplay reflection={result.reflection} t={t} />
            </section>

            {/* Save Actions */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t py-4 -mx-6 px-6 mt-6">
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setResult(null)}>
                  {t('analysisDetail.reAnalyze')}
                </Button>
                <Button onClick={handleSaveAll} disabled={isSaving} className="gap-2" size="lg">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? t('analysisDetail.saving') : t('analysisDetail.saveResults')}
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
  t,
}: {
  question: ExtractedQuestion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  const categoryConfig = QUESTION_CATEGORIES[question.category];
  const QUALITY_CONFIG = getQualityConfig(t);
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
                  {t(`questionCategory.${question.category}`)}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', qualityConfig.color)}>
                  <QualityIcon className="w-3 h-3 mr-1" />
                  {qualityConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{t('analysisDetail.difficulty')} {question.difficulty}/5</span>
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
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('interview.whatWorked')}</p>
              <p className="text-sm">{question.myAnswerSummary}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('interview.interviewFocus')}</p>
              <p className="text-sm">{question.evaluationFocus}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('roleDebrief.reasons')}</p>
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
function ReflectionDisplay({ reflection, t }: { reflection: ExtractedReflection; t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      {/* Overall assessment */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</span>
            {t('interview.overview')}
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
            {t('analysisDetail.whatWentWell')}
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
            {t('analysisDetail.whatCouldImprove')}
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
            {t('analysisDetail.keyTakeaways')}
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
            {t('analysisDetail.interviewerStyle')}
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
            {t('analysisDetail.companyInsights')}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.companyInsights}</p>
        </CardContent>
      </Card>
    </div>
  );
}
