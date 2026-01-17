import { InterviewPrepAnalysis, PredictedQuestion } from "@/types/interview-prep";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  MessageCircle, 
  Copy, 
  CheckCircle,
  Lightbulb,
  FileText,
  Briefcase,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface AnalysisDisplayProps {
  analysis: InterviewPrepAnalysis;
  onStartMockInterview: () => void;
}

function getSourceBadgeVariant(source: PredictedQuestion["sourceReference"]) {
  switch (source) {
    case "JD":
      return "default";
    case "Resume":
      return "secondary";
    case "Interview Experience":
      return "outline";
    case "Combined":
      return "destructive";
    default:
      return "default";
  }
}

function getSourceIcon(source: PredictedQuestion["sourceReference"]) {
  switch (source) {
    case "JD":
      return <Briefcase className="h-3 w-3" />;
    case "Resume":
      return <FileText className="h-3 w-3" />;
    case "Interview Experience":
      return <MessageCircle className="h-3 w-3" />;
    case "Combined":
      return <Zap className="h-3 w-3" />;
    default:
      return null;
  }
}

export function AnalysisDisplay({ analysis, onStartMockInterview }: AnalysisDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyQuestion = async (question: string, index: number) => {
    await navigator.clipboard.writeText(question);
    setCopiedIndex(index);
    toast({ title: "已复制问题", description: "问题已复制到剪贴板" });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllQuestions = async () => {
    const text = analysis.predictedQuestions
      .map((q, i) => `${i + 1}. ${q.question}\n   Why: ${q.whyLikely}\n   Skill: ${q.skillTested}`)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    toast({ title: "已复制全部问题", description: "10个问题已复制到剪贴板" });
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={onStartMockInterview} className="flex-1 sm:flex-none">
          <MessageCircle className="mr-2 h-4 w-4" />
          开始模拟面试
        </Button>
        <Button variant="outline" onClick={copyAllQuestions}>
          <Copy className="mr-2 h-4 w-4" />
          复制全部问题
        </Button>
      </div>

      {/* JD Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            JD 分析
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">核心职责</h4>
            <ul className="space-y-1">
              {analysis.jdAnalysis.coreResponsibilities.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">关键能力</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.jdAnalysis.keyCompetencies.map((item, i) => (
                <Badge key={i} variant="secondary">{item}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">重点领域</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.jdAnalysis.focusAreas.map((item, i) => (
                <Badge key={i} variant="outline">{item}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            候选人画像
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              优势
            </h4>
            <ul className="space-y-1">
              {analysis.candidateProfile.strengths.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              潜在弱点
            </h4>
            <ul className="space-y-1">
              {analysis.candidateProfile.potentialWeakPoints.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-amber-500 mt-1">!</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-2">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-blue-600">
              <Lightbulb className="h-4 w-4" />
              代表性经历
            </h4>
            <ul className="space-y-1">
              {analysis.candidateProfile.signatureExperiences.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-blue-500 mt-1">★</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Interview Patterns */}
      {(analysis.interviewPatterns.highFrequencyTopics.length > 0 || 
        analysis.interviewPatterns.companySpecificPatterns.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
              面经分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.interviewPatterns.highFrequencyTopics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">高频话题</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.interviewPatterns.highFrequencyTopics.map((item, i) => (
                    <Badge key={i} variant="default">{item}</Badge>
                  ))}
                </div>
              </div>
            )}
            {analysis.interviewPatterns.companySpecificPatterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">公司特色</h4>
                <ul className="space-y-1">
                  {analysis.interviewPatterns.companySpecificPatterns.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Predicted Questions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Top 10 预测问题
          </CardTitle>
          <CardDescription>
            按可能性排序的面试问题预测
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.predictedQuestions.map((q, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {q.rank}
                      </span>
                      <Badge variant={getSourceBadgeVariant(q.sourceReference)} className="gap-1">
                        {getSourceIcon(q.sourceReference)}
                        {q.sourceReference}
                      </Badge>
                      <Badge variant="outline">{q.skillTested}</Badge>
                    </div>
                    <p className="font-medium mb-2">{q.question}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">为什么会问：</span>
                      {q.whyLikely}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyQuestion(q.question, index)}
                    className="flex-shrink-0"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
