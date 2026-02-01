import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { InterviewQuestion, InterviewReflection } from '@/types/job';
import { AnalyticsJobTree } from '@/components/analytics/AnalyticsJobTree';
import { AnalysisDetailPanel } from '@/components/analytics/AnalysisDetailPanel';
import { RoleDebriefPanel } from '@/components/analytics/RoleDebriefPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  BarChart3,
  FileText,
  Sparkles,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { jobs, updateJob, loading } = useJobs();
  
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    searchParams.get('jobId')
  );
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    searchParams.get('stageId')
  );
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'rounds' | 'debrief'>('rounds');

  // Sync URL params with state
  useEffect(() => {
    const jobId = searchParams.get('jobId');
    const stageId = searchParams.get('stageId');
    
    if (jobId && stageId) {
      setSelectedJobId(jobId);
      setSelectedStageId(stageId);
      setExpandedJobs(prev => new Set([...prev, jobId]));
    }
  }, [searchParams]);

  const handleSelect = (jobId: string, stageId: string) => {
    setSelectedJobId(jobId);
    setSelectedStageId(stageId);
    setSearchParams({ jobId, stageId });
  };

  const handleToggleJob = (jobId: string) => {
    setExpandedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const handleSaveAnalysis = async (questions: InterviewQuestion[], reflection: InterviewReflection) => {
    if (!selectedJobId || !selectedStageId) return;
    
    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) return;

    const updatedStages = job.stages.map(s => {
      if (s.id === selectedStageId) {
        return {
          ...s,
          questions: [...(s.questions || []), ...questions],
          reflection,
        };
      }
      return s;
    });

    await updateJob(selectedJobId, { stages: updatedStages });
  };

  // Find selected job and stage
  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null;
  const selectedStage = selectedJob?.stages.find(s => s.id === selectedStageId);

  // Check if job has enough analyzed rounds for debrief
  const analyzedRoundsCount = selectedJob?.stages.filter(
    s => s.status === 'completed' && (s.questions?.length || s.reflection)
  ).length || 0;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Page Header */}
        <div className="shrink-0 px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Analytics & Insights</h1>
                <p className="text-sm text-muted-foreground">
                  AI 面试分析中心 · 按职位管理所有面试记录与复盘
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Split Panel Layout */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Job Tree */}
            <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
              <div className="h-full border-r bg-muted/30 flex flex-col">
                <div className="p-3 border-b shrink-0">
                  <h2 className="text-sm font-medium text-muted-foreground px-2">
                    面试记录
                  </h2>
                </div>
                <div className="flex-1 min-h-0">
                  <AnalyticsJobTree
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    selectedStageId={selectedStageId}
                    onSelect={handleSelect}
                    expandedJobs={expandedJobs}
                    onToggleJob={handleToggleJob}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Detail View with Tabs */}
            <ResizablePanel defaultSize={72}>
              <div className="h-full bg-background flex flex-col">
                {selectedJob ? (
                  <>
                    {/* Tab Navigation */}
                    <div className="shrink-0 border-b px-4">
                      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rounds' | 'debrief')}>
                        <TabsList className="h-12 bg-transparent p-0 gap-4">
                          <TabsTrigger 
                            value="rounds" 
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            轮次分析
                          </TabsTrigger>
                          <TabsTrigger 
                            value="debrief" 
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Role Debrief
                            {analyzedRoundsCount >= 2 && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                NEW
                              </Badge>
                            )}
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 min-h-0">
                      {activeTab === 'rounds' ? (
                        selectedStage ? (
                          <AnalysisDetailPanel
                            job={selectedJob}
                            stage={selectedStage}
                            onSave={handleSaveAnalysis}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center max-w-sm p-8">
                              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">
                                从左侧选择一个面试轮次查看或添加分析
                              </p>
                            </div>
                          </div>
                        )
                      ) : (
                        <RoleDebriefPanel job={selectedJob} />
                      )}
                    </div>
                  </>
                ) : (
                  /* Empty State */
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md p-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold mb-2">选择一轮面试开始分析</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        从左侧选择一个职位和面试轮次，粘贴面试记录后 AI 将自动提取问题并生成复盘分析
                      </p>
                      <div className="flex flex-col gap-3 text-left bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-medium text-primary">
                            1
                          </div>
                          <p className="text-sm">选择左侧的公司和面试轮次</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-medium text-primary">
                            2
                          </div>
                          <p className="text-sm">粘贴或上传面试记录</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-medium text-primary">
                            3
                          </div>
                          <p className="text-sm">AI 自动提取问题并生成复盘</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </DashboardLayout>
  );
}
