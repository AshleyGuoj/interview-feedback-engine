import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Lightbulb, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ExtractedQuestion, 
  ExtractedReflection, 
  TranscriptAnalysisResult,
  TranscriptAnalysisContext 
} from '@/types/transcript-analysis';
import { useLanguage } from '@/hooks/useLanguage';
import { InterviewQuestion, InterviewReflection } from '@/types/job';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface TranscriptAnalyzerProps {
  context?: TranscriptAnalysisContext;
  onQuestionsExtracted?: (questions: InterviewQuestion[]) => void;
  onReflectionGenerated?: (reflection: InterviewReflection) => void;
  onClose?: () => void;
}

const QUALITY_CONFIG = {
  high: { label: '回答优秀', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  medium: { label: '回答一般', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertCircle },
  low: { label: '需要改进', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle },
};

export function TranscriptAnalyzer({ 
  context, 
  onQuestionsExtracted, 
  onReflectionGenerated,
  onClose 
}: TranscriptAnalyzerProps) {
  const { language } = useLanguage();
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TranscriptAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const handleAnalyze = async () => {
    if (!transcript.trim() || transcript.length < 50) {
      toast.error('请输入更详细的面试记录（至少50个字符）');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-transcript', {
        body: { transcript, context, language },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      setActiveTab('questions');
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

  const handleApplyQuestions = () => {
    if (!result || !onQuestionsExtracted) return;

    // Convert extracted questions to InterviewQuestion format
    const questions: InterviewQuestion[] = result.questions.map((q, index) => ({
      id: `extracted-${Date.now()}-${index}`,
      question: q.question,
      category: q.category,
      myAnswer: q.myAnswerSummary,
      difficulty: q.difficulty,
      wasAsked: true,
      answeredWell: q.responseQuality === 'high',
      tags: q.tags,
    }));

    onQuestionsExtracted(questions);
    toast.success(`已添加 ${questions.length} 个问题到记录`);
  };

  const handleApplyReflection = () => {
    if (!result || !onReflectionGenerated) return;

    const reflection: InterviewReflection = {
      overallFeeling: result.reflection.overallFeeling,
      whatWentWell: result.reflection.whatWentWell,
      whatCouldImprove: result.reflection.whatCouldImprove,
      keyTakeaways: result.reflection.keyTakeaways,
      interviewerVibe: result.reflection.interviewerVibe,
      companyInsights: result.reflection.companyInsights,
    };

    onReflectionGenerated(reflection);
    toast.success('已生成复盘内容');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI 面试记录分析</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          粘贴面试记录，AI 自动提取问题并生成复盘
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input" className="gap-1.5">
              <FileText className="w-4 h-4" />
              输入记录
            </TabsTrigger>
            <TabsTrigger value="questions" disabled={!result} className="gap-1.5">
              <MessageSquare className="w-4 h-4" />
              问题提取
              {result && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {result.questions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reflection" disabled={!result} className="gap-1.5">
              <Lightbulb className="w-4 h-4" />
              面试复盘
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder={`粘贴你的面试记录...

支持格式：
- 纯文本笔记
- 聊天记录
- 混合中英文
- 无需格式化

示例：
面试官问了我为什么想加入这家公司，我说了对产品的理解...
然后问了一个系统设计题，设计一个电商系统...`}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{transcript.length} 字符</span>
                <span>建议 500+ 字符以获得更好的分析效果</span>
              </div>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || transcript.length < 50}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在分析...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始 AI 分析
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            {result && (
              <div className="space-y-4">
                {/* Metadata summary */}
                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
                  <Badge variant="outline">
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

                {/* Questions list */}
                <ScrollArea className="h-[400px] pr-4">
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
                </ScrollArea>

                {/* Apply button */}
                {onQuestionsExtracted && (
                  <Button onClick={handleApplyQuestions} className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    应用到问题记录 ({result.questions.length} 个)
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reflection" className="mt-4">
            {result && (
              <div className="space-y-4">
                <ReflectionPreview reflection={result.reflection} />
                
                {onReflectionGenerated && (
                  <Button onClick={handleApplyReflection} className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    应用到面试复盘
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
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
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left">
            <span className="text-sm font-medium text-muted-foreground w-6">
              Q{index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{question.question}</p>
              <div className="flex items-center gap-2 mt-1.5">
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
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 space-y-3 border-t bg-muted/30">
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
              <div className="flex flex-wrap gap-1">
                {question.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Reflection preview component
function ReflectionPreview({ reflection }: { reflection: ExtractedReflection }) {
  return (
    <ScrollArea className="h-[450px] pr-4">
      <div className="space-y-4">
        {/* Overall assessment */}
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm font-medium mb-2">整体评估</p>
          <p className="text-sm text-muted-foreground">{reflection.performanceSummary}</p>
        </div>

        {/* What went well */}
        <div className="p-4 rounded-lg border bg-emerald-50/50 border-emerald-200">
          <p className="text-sm font-medium mb-2 flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            表现好的地方
          </p>
          <ul className="space-y-1">
            {reflection.whatWentWell.map((item, i) => (
              <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                <span className="text-emerald-500 mt-1.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What could improve */}
        <div className="p-4 rounded-lg border bg-amber-50/50 border-amber-200">
          <p className="text-sm font-medium mb-2 flex items-center gap-2 text-amber-700">
            <AlertCircle className="w-4 h-4" />
            可以改进的地方
          </p>
          <ul className="space-y-1">
            {reflection.whatCouldImprove.map((item, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="text-amber-500 mt-1.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Key takeaways */}
        <div className="p-4 rounded-lg border bg-blue-50/50 border-blue-200">
          <p className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-700">
            <Lightbulb className="w-4 h-4" />
            关键收获
          </p>
          <ul className="space-y-1">
            {reflection.keyTakeaways.map((item, i) => (
              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-500 mt-1.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Interviewer vibe */}
        {reflection.interviewerVibe && (
          <div className="p-4 rounded-lg border">
            <p className="text-sm font-medium mb-2">面试官印象</p>
            <p className="text-sm text-muted-foreground">{reflection.interviewerVibe}</p>
          </div>
        )}

        {/* Company insights */}
        {reflection.companyInsights && (
          <div className="p-4 rounded-lg border">
            <p className="text-sm font-medium mb-2">公司新认知</p>
            <p className="text-sm text-muted-foreground">{reflection.companyInsights}</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
