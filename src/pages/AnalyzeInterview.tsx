import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { HeroSection } from '@/components/interview/HeroSection';
import { InterviewForm } from '@/components/interview/InterviewForm';
import { LoadingState } from '@/components/interview/LoadingState';
import { AnalysisResults } from '@/components/interview/AnalysisResults';
import { InterviewInput, AnalysisResult } from '@/types/interview';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalyzeInterview() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (data: InterviewInput) => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-interview', {
        body: { ...data, language },
      });

      if (error) {
        throw error;
      }

      setResult(analysisResult);
      toast.success('Interview analysis complete!');
    } catch (error) {
      console.error('Error analyzing interview:', error);
      toast.error('Failed to analyze interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {isLoading ? (
          <LoadingState />
        ) : result ? (
          <AnalysisResults result={result} onReset={handleReset} />
        ) : (
          <>
            <HeroSection />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <InterviewForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
