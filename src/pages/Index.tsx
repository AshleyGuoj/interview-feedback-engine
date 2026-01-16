import { useState } from "react";
import { HeroSection } from "@/components/interview/HeroSection";
import { InterviewForm } from "@/components/interview/InterviewForm";
import { AnalysisResults } from "@/components/interview/AnalysisResults";
import { LoadingState } from "@/components/interview/LoadingState";
import { InterviewInput, AnalysisResult } from "@/types/interview";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (data: InterviewInput) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data: analysisResult, error } = await supabase.functions.invoke("analyze-interview", {
        body: data,
      });

      if (error) {
        throw error;
      }

      setResult(analysisResult);
      toast.success("Interview analysis complete!");
    } catch (error) {
      console.error("Error analyzing interview:", error);
      toast.error("Failed to analyze interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container max-w-4xl py-12 px-4">
        {!result && !isLoading && (
          <>
            <HeroSection />
            <InterviewForm onSubmit={handleSubmit} isLoading={isLoading} />
          </>
        )}

        {isLoading && <LoadingState />}

        {result && <AnalysisResults result={result} onReset={handleReset} />}
      </div>
    </div>
  );
}
