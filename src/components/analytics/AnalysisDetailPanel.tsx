import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Job, InterviewStage, InterviewQuestion, InterviewReflection, QUESTION_CATEGORIES } from '@/types/job';
import { InterviewPosterModal } from '@/components/analytics/InterviewPosterModal';
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
  Minus,
  TrendingDown,
  AlertTriangle,
  Check,
  ArrowRight,
  Image,
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
  high: { label: t('analysisDetail.qualityHigh'), color: 'text-[hsl(var(--accent-sage))] bg-[hsl(var(--accent-sage))]/5 border-[hsl(var(--accent-sage))]/20', icon: CheckCircle2 },
  medium: { label: t('analysisDetail.qualityMedium'), color: 'text-muted-foreground bg-muted/50 border-border', icon: AlertCircle },
  low: { label: t('analysisDetail.qualityLow'), color: 'text-[hsl(var(--accent-rose))]/70 bg-[hsl(var(--accent-rose))]/5 border-[hsl(var(--accent-rose))]/20', icon: AlertCircle },
});

const FEELING_ICON_MAP = {
  great: Sparkles,
  good: ThumbsUp,
  neutral: Minus,
  poor: TrendingDown,
  bad: AlertTriangle,
} as const;

const FEELING_COLOR_MAP = {
  great: 'text-[hsl(var(--accent-sage))]',
  good: 'text-[hsl(var(--accent-sage))]/70',
  neutral: 'text-muted-foreground',
  poor: 'text-[hsl(var(--accent-rose))]/70',
  bad: 'text-[hsl(var(--accent-rose))]',
} as const;

const getFeelingConfig = (t: (key: string) => string) => ({
  great: { label: t('analysisDetail.feelingGreat'), color: 'text-[hsl(var(--accent-sage))]' },
  good: { label: t('analysisDetail.feelingGood'), color: 'text-[hsl(var(--accent-sage))]/70' },
  neutral: { label: t('analysisDetail.feelingNeutral'), color: 'text-muted-foreground' },
  poor: { label: t('analysisDetail.feelingPoor'), color: 'text-[hsl(var(--accent-rose))]/70' },
  bad: { label: t('analysisDetail.feelingBad'), color: 'text-[hsl(var(--accent-rose))]' },
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
  const [showReanalyzeInput, setShowReanalyzeInput] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [showPoster, setShowPoster] = useState(false);

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
        responseQuality: q.responseQuality,
        evaluationFocus: q.evaluationFocus,
        qualityReasoning: q.qualityReasoning,
      }));

      const newReflection: InterviewReflection = {
        overallFeeling: result.reflection.overallFeeling,
        performanceSummary: result.reflection.performanceSummary,
        whatWentWell: result.reflection.whatWentWell,
        whatCouldImprove: result.reflection.whatCouldImprove,
        keyTakeaways: result.reflection.keyTakeaways,
        interviewerVibe: result.reflection.interviewerVibe,
        companyInsights: result.reflection.companyInsights,
      };

      await onSave(newQuestions, newReflection);
      toast.success(t('analysisDetail.savedSuccess'));
      setResult(null);
      setShowReanalyzeInput(false);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error(t('analysisDetail.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // Show existing analysis if available
  if (hasExistingAnalysis && !result && !showReanalyzeInput) {
    return (
      <>
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
              <Badge className="bg-primary/10 text-primary">
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
                  <SavedQuestionCard key={q.id} question={q} index={index} t={t} />
                ))}
              </div>
            </section>
          )}

          {/* Existing Reflection */}
          {stage.reflection && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent-cool))]/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-[hsl(var(--accent-cool))]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{t('analysisDetail.interviewDebrief')}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    {(() => {
                      const FeelingIcon = FEELING_ICON_MAP[stage.reflection.overallFeeling];
                      return FeelingIcon ? <FeelingIcon className={cn("w-3.5 h-3.5", FEELING_COLOR_MAP[stage.reflection.overallFeeling])} /> : null;
                    })()}
                    {FEELING_CONFIG[stage.reflection.overallFeeling]?.label}
                  </p>
                </div>
              </div>

              <ReflectionDisplay
                reflection={{
                  overallFeeling: stage.reflection.overallFeeling,
                  performanceSummary: stage.reflection.performanceSummary,
                  whatWentWell: stage.reflection.whatWentWell ?? [],
                  whatCouldImprove: stage.reflection.whatCouldImprove ?? [],
                  keyTakeaways: stage.reflection.keyTakeaways ?? [],
                  interviewerVibe: stage.reflection.interviewerVibe ?? '',
                  companyInsights: stage.reflection.companyInsights ?? '',
                }}
                t={t}
              />
            </section>
          )}

          {/* Re-analyze button + poster button */}
          <div className="pt-4 border-t flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setShowReanalyzeInput(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t('analysisDetail.reAnalyze')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPoster(true)}
              className="gap-2"
            >
              <Image className="w-4 h-4" />
              生成海报
            </Button>
          </div>
        </div>
      </ScrollArea>

      <InterviewPosterModal
        open={showPoster}
        onOpenChange={setShowPoster}
        job={job}
        stage={stage}
      />
    </>
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
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent-cool))]/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-[hsl(var(--accent-cool))]" />
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

// Saved question card (mirrors QuestionCard but uses InterviewQuestion type)
function SavedQuestionCard({
  question,
  index,
  t,
}: {
  question: InterviewQuestion;
  index: number;
  t: (key: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const QUALITY_CONFIG = getQualityConfig(t);
  const qualityConfig = question.responseQuality ? QUALITY_CONFIG[question.responseQuality] : null;
  const QualityIcon = qualityConfig?.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
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
                {qualityConfig && QualityIcon && (
                  <Badge variant="outline" className={cn('text-xs', qualityConfig.color)}>
                    <QualityIcon className="w-3 h-3 mr-1" />
                    {qualityConfig.label}
                  </Badge>
                )}
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
            {question.myAnswer && (
              <div className="pt-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('interview.whatWorked')}</p>
                <p className="text-sm">{question.myAnswer}</p>
              </div>
            )}
            {question.evaluationFocus && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('interview.interviewFocus')}</p>
                <p className="text-sm">{question.evaluationFocus}</p>
              </div>
            )}
            {question.qualityReasoning && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t('roleDebrief.reasons')}</p>
                <p className="text-sm text-muted-foreground">{question.qualityReasoning}</p>
              </div>
            )}
            {question.tags && question.tags.length > 0 && (
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
function ReflectionDisplay({ reflection, t }: { reflection: ExtractedReflection | (Omit<ExtractedReflection, 'performanceSummary'> & { performanceSummary?: string }); t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      {/* Overall assessment */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">1</span>
            {t('interview.overview')}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.performanceSummary}</p>
        </CardContent>
      </Card>

      {/* What went well */}
      <div className="border-l-2 border-l-[hsl(var(--accent-sage))]/40 pl-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent-sage))]/10 flex items-center justify-center text-xs text-[hsl(var(--accent-sage))]">2</span>
          <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent-sage))]/60" />
          {t('analysisDetail.whatWentWell')}
        </h3>
        <ul className="space-y-1.5">
          {reflection.whatWentWell.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-[hsl(var(--accent-sage))]/60 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* What could improve */}
      <div className="border-l-2 border-l-[hsl(var(--accent-rose))]/40 pl-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent-rose))]/10 flex items-center justify-center text-xs text-[hsl(var(--accent-rose))]">3</span>
          <AlertCircle className="w-4 h-4 text-[hsl(var(--accent-rose))]/60" />
          {t('analysisDetail.whatCouldImprove')}
        </h3>
        <ul className="space-y-1.5">
          {reflection.whatCouldImprove.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--accent-rose))]/60 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Key takeaways */}
      <div className="rounded-xl bg-[hsl(var(--accent-cool))]/5 p-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[hsl(var(--accent-cool))]/10 flex items-center justify-center text-xs text-[hsl(var(--accent-cool))]">4</span>
          <Lightbulb className="w-4 h-4 text-[hsl(var(--accent-cool))]/60" />
          {t('analysisDetail.keyTakeaways')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {reflection.keyTakeaways.map((item, i) => (
            <Badge key={i} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      </div>

      {/* Interviewer vibe */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">5</span>
          {t('analysisDetail.interviewerStyle')}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{reflection.interviewerVibe}</p>
      </div>

      {/* Company insights */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">6</span>
          {t('analysisDetail.companyInsights')}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{reflection.companyInsights}</p>
      </div>
    </div>
  );
}
