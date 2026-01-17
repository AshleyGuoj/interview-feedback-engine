import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InterviewPrepForm } from "@/components/interview-prep/InterviewPrepForm";
import { AnalysisDisplay } from "@/components/interview-prep/AnalysisDisplay";
import { MockInterviewChat } from "@/components/interview-prep/MockInterviewChat";
import { InterviewPrepAnalysis } from "@/types/interview-prep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain } from "lucide-react";

type ViewMode = "form" | "analysis" | "mock-interview";

export default function InterviewPrep() {
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<InterviewPrepAnalysis | null>(null);
  const [formData, setFormData] = useState<{ resume: string; jobDescription: string; interviewNotes: string } | null>(null);

  const handleSubmit = async (data: { resume: string; jobDescription: string; interviewNotes: string }) => {
    setIsLoading(true);
    setFormData(data);

    try {
      const { data: result, error } = await supabase.functions.invoke("interview-prep-agent", {
        body: {
          mode: "analyze",
          resume: data.resume,
          jobDescription: data.jobDescription,
          interviewNotes: data.interviewNotes || null,
        },
      });

      if (error) {
        throw error;
      }

      setAnalysis(result);
      setViewMode("analysis");
      toast({
        title: "分析完成",
        description: "已生成面试准备分析和问题预测",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setViewMode("form");
    setAnalysis(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {viewMode !== "form" && (
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={handleReset}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              重新分析
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">面试准备 Agent</h1>
              <p className="text-muted-foreground">
                AI 驱动的面试问题预测与模拟面试
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "form" && (
          <InterviewPrepForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {viewMode === "analysis" && analysis && (
          <AnalysisDisplay 
            analysis={analysis} 
            onStartMockInterview={() => setViewMode("mock-interview")}
          />
        )}

        {viewMode === "mock-interview" && analysis && (
          <MockInterviewChat 
            analysis={analysis} 
            onBack={() => setViewMode("analysis")}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
