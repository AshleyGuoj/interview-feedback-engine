import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { InterviewQuestion, InterviewReflection } from '@/types/job';
import { AnalyticsJobTree } from '@/components/analytics/AnalyticsJobTree';
import { AnalyticsContextBar } from '@/components/analytics/AnalyticsContextBar';
import { AnalysisDetailPanel } from '@/components/analytics/AnalysisDetailPanel';
import { RoleDebriefPanel } from '@/components/analytics/RoleDebriefPanel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  BarChart3,
  FileText,
  Sparkles,
  TrendingUp,
  Lock,
} from 'lucide-react';

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs, updateJob } = useJobs();
  
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
      // Always default to rounds tab when navigating
      setActiveTab('rounds');
    }
  }, [searchParams]);

  const handleSelect = (jobId: string, stageId: string) => {
    setSelectedJobId(jobId);
    setSelectedStageId(stageId);
    setSearchParams({ jobId, stageId });
    // Always default to Interview Analysis when selecting a round
    setActiveTab('rounds');
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
  const isDebriefUnlocked = analyzedRoundsCount >= 2;

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
            <ResizablePanel defaultSize={22} minSize={18} maxSize={30}>
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
            <ResizablePanel defaultSize={78}>
              <div className="h-full bg-background flex flex-col">
                {selectedJob ? (
                  <>
                    {/* Context Bar - Always visible */}
                    <AnalyticsContextBar job={selectedJob} stage={selectedStage} />

                    {/* Tab Navigation */}
                    <div className="shrink-0 border-b px-4">
                      <Tabs value={activeTab} onValueChange={(v) => {
                        if (v === 'debrief' && !isDebriefUnlocked) return;
                        setActiveTab(v as 'rounds' | 'debrief');
                      }}>
                        <TabsList className="h-12 bg-transparent p-0 gap-4">
                          <TabsTrigger 
                            value="rounds" 
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            面试分析
                          </TabsTrigger>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={!isDebriefUnlocked ? 'cursor-not-allowed' : ''}>
                                  <TabsTrigger 
                                    value="debrief" 
                                    disabled={!isDebriefUnlocked}
                                    className={`data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 ${!isDebriefUnlocked ? 'opacity-50 pointer-events-none' : ''}`}
                                  >
                                    {!isDebriefUnlocked ? (
                                      <Lock className="w-4 h-4 mr-2" />
                                    ) : (
                                      <TrendingUp className="w-4 h-4 mr-2" />
                                    )}
                                    Role Debrief
                                    {isDebriefUnlocked && (
                                      <span className="ml-2 text-xs text-primary">✨</span>
                                    )}
                                  </TabsTrigger>
                                </span>
                              </TooltipTrigger>
                              {!isDebriefUnlocked && (
                                <TooltipContent>
                                  <p>完成至少 2 轮面试分析后解锁</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 min-h-0 overflow-auto">
                      <div className="max-w-4xl mx-auto">
                        {activeTab === 'rounds' ? (
                          selectedStage ? (
                            <AnalysisDetailPanel
                              job={selectedJob}
                              stage={selectedStage}
                              onSave={handleSaveAnalysis}
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center py-24">
                              <div className="text-center max-w-sm">
                                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                  从左侧选择一个面试轮次查看分析
                                </p>
                              </div>
                            </div>
                          )
                        ) : (
                          <RoleDebriefPanel job={selectedJob} />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Empty State - Calm, AI-native language */
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md p-8">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold mb-3">选择一轮面试开始分析</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        粘贴你的面试笔记或录音转写，我们会自动提取问题模式、评估表现并提供改进建议。
                      </p>
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
