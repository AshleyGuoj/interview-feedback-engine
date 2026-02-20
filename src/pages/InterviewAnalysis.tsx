import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
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
  Check,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  TranscriptAnalysisResult,
  ExtractedQuestion, 
  ExtractedReflection 
} from '@/types/transcript-analysis';
import { InterviewQuestion, InterviewReflection, InterviewStage } from '@/types/job';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TranscriptInput } from '@/components/interview/TranscriptInput';
import { useLanguage } from '@/hooks/useLanguage';

const QUALITY_CONFIG = {
  high: { label: '回答优秀', color: 'text-primary bg-primary/5 border-primary/20', icon: CheckCircle2 },
  medium: { label: '回答一般', color: 'text-muted-foreground bg-muted/50 border-border', icon: AlertCircle },
  low: { label: '需要改进', color: 'text-muted-foreground/70 bg-muted/30 border-border', icon: AlertCircle },
};

export default function InterviewAnalysis() {
  const { jobId, stageId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { jobs, updateJob } = useJobs();
  const { language } = useLanguage();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TranscriptAnalysisResult | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Find the job and stage
  const job = jobs.find(j => j.id === jobId);
  const stage = job?.stages.find(s => s.id === stageId);

  // Check if coming from a navigation with existing analysis
  useEffect(() => {
    const analysisData = searchParams.get('analysis');
    if (analysisData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(analysisData));
        setResult(parsed);
      } catch (e) {
        console.error('Failed to parse analysis data:', e);
      }
    }
  }, [searchParams]);

  if (!job || !stage) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">未找到面试记录</p>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          language,
          context: {
            company: job.companyName,
            role: job.roleTitle,
            stage: stage.name,
          }
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast.success(`成功提取 ${data.questions.length} 个问题和完整复盘`);
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      if (error instanceof Error && error.message.includes('Rate limit')) {
        toast.error('请求过于频繁，请稍后再试');
      } else if (error instanceof Error && error.message.includes('Payment')) {
        toast.error('AI 额度已用完，请添加额度后继续');
      } else {
        toast.error(error instanceof Error ? error.message : '分析失败，请重试');
      }
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
      // Convert extracted questions to InterviewQuestion format
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

      // Create reflection
      const newReflection: InterviewReflection = {
        overallFeeling: result.reflection.overallFeeling,
        whatWentWell: result.reflection.whatWentWell,
        whatCouldImprove: result.reflection.whatCouldImprove,
        keyTakeaways: result.reflection.keyTakeaways,
        interviewerVibe: result.reflection.interviewerVibe,
        companyInsights: result.reflection.companyInsights,
      };

      // Update the stage with new questions and reflection
      const updatedStages = job.stages.map(s => {
        if (s.id === stageId) {
          return {
            ...s,
            questions: [...(s.questions || []), ...newQuestions],
            reflection: newReflection,
          };
        }
        return s;
      });

      await updateJob(job.id, { stages: updatedStages });
      toast.success('已保存分析结果到面试记录');
      
      // Navigate back to job detail
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Page Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/jobs/${jobId}`)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回 Timeline
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{job.companyName}</span>
                  </div>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{job.roleTitle}</span>
                  </div>
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
                    {format(new Date(stage.scheduledTime), 'MM/dd HH:mm')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* Section 1: Input Area */}
            {!result && (
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
                
                <TranscriptInput 
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              </section>
            )}

            {/* Results Section */}
            {result && (
              <>
                {/* Metadata summary */}
                <div className="flex flex-wrap gap-3 p-4 rounded-lg bg-muted/50 border">
                  <Badge variant="outline" className="gap-1.5">
                    <MessageSquare className="w-3 h-3" />
                    共 {result.metadata.totalQuestions} 个问题
                  </Badge>
                  <Badge variant="outline">
                    主要类型: {result.metadata.dominantCategory}
                  </Badge>
                  <Badge variant="outline">
                    难度: {result.metadata.overallDifficulty}
                  </Badge>
                  <Badge variant="outline">
                    语言: {result.metadata.languageDetected}
                  </Badge>
                </div>

                {/* Section 2: Extracted Questions */}
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

                {/* Section 3: Detailed Reflection */}
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">面试复盘分析</h2>
                      <p className="text-sm text-muted-foreground">
                        基于你的面试记录生成的详细复盘
                      </p>
                    </div>
                  </div>
                  
                  <ReflectionDisplay reflection={result.reflection} />
                </section>

                {/* Save Actions */}
                <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t py-4 -mx-6 px-6">
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setResult(null)}
                    >
                      重新分析
                    </Button>
                    <Button 
                      onClick={handleSaveAll}
                      disabled={isSaving}
                      className="gap-2"
                      size="lg"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      保存到面试记录
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Question card component
function QuestionCard({ 
  question, 
  index, 
  isExpanded, 
  onToggle 
}: { 
  question: ExtractedQuestion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const qualityConfig = QUALITY_CONFIG[question.responseQuality];
  const QualityIcon = qualityConfig.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors text-left">
            <span className="text-sm font-medium text-muted-foreground w-8 shrink-0">
              Q{index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{question.question}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {t(`questionCategory.${question.category}`)}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", qualityConfig.color)}
                >
                  <QualityIcon className="w-3 h-3 mr-1" />
                  {qualityConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  难度 {question.difficulty}/5
                </span>
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
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">1</span>
            整体评估
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.performanceSummary}</p>
        </CardContent>
      </Card>

      {/* What went well */}
      <div className="border-l-2 border-l-primary/40 pl-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">2</span>
          <CheckCircle2 className="w-4 h-4 text-primary/60" />
          表现好的地方
        </h3>
        <ul className="space-y-1.5">
          {reflection.whatWentWell.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What could improve */}
      <div className="border-l-2 border-l-muted-foreground/30 pl-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">3</span>
          <AlertCircle className="w-4 h-4 text-muted-foreground/60" />
          可以改进的地方
        </h3>
        <ul className="space-y-1.5">
          {reflection.whatCouldImprove.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key takeaways */}
      <div className="rounded-xl bg-muted/20 p-4 space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">4</span>
          <Lightbulb className="w-4 h-4 text-primary/60" />
          关键收获
        </h3>
        <ul className="space-y-1.5">
          {reflection.keyTakeaways.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interviewer vibe */}
      {reflection.interviewerVibe && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">5</span>
            面试官印象
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.interviewerVibe}</p>
        </div>
      )}

      {/* Company insights */}
      {reflection.companyInsights && (
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary">6</span>
            公司新认知
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{reflection.companyInsights}</p>
        </div>
      )}
    </div>
  );
}
