import { useMemo, useState } from 'react';
import { useJobs } from '@/contexts/JobsContext';
import { Job, InterviewStage, QUESTION_CATEGORIES, REFLECTION_FEELINGS } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Building2, 
  Briefcase, 
  ChevronDown, 
  ChevronUp,
  Calendar, 
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface InterviewRecord {
  job: Job;
  stage: InterviewStage;
  sortDate: Date;
}

export function GlobalInterviewTimeline() {
  const { jobs } = useJobs();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'upcoming'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Flatten all interview stages from all jobs into a single timeline
  const allInterviews = useMemo(() => {
    const records: InterviewRecord[] = [];
    
    jobs.forEach(job => {
      job.stages.forEach(stage => {
        // Only include stages that have meaningful content or are interview-related
        if (stage.name.toLowerCase() === 'applied') return;
        
        const sortDate = stage.scheduledTime 
          ? new Date(stage.scheduledTime)
          : stage.date 
            ? new Date(stage.date)
            : new Date(job.updatedAt);
        
        records.push({ job, stage, sortDate });
      });
    });
    
    // Sort by date, most recent first
    records.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
    
    return records;
  }, [jobs]);

  // Apply filters
  const filteredInterviews = useMemo(() => {
    return allInterviews.filter(record => {
      // Status filter
      if (statusFilter === 'completed' && record.stage.status !== 'completed') return false;
      if (statusFilter === 'upcoming' && record.stage.status !== 'upcoming') return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchCompany = record.job.companyName.toLowerCase().includes(query);
        const matchRole = record.job.roleTitle.toLowerCase().includes(query);
        const matchStage = record.stage.name.toLowerCase().includes(query);
        const matchQuestions = record.stage.questions?.some(q => 
          q.question.toLowerCase().includes(query)
        );
        
        if (!matchCompany && !matchRole && !matchStage && !matchQuestions) return false;
      }
      
      return true;
    });
  }, [allInterviews, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const completedInterviews = allInterviews.filter(r => r.stage.status === 'completed');
    const totalQuestions = completedInterviews.reduce(
      (sum, r) => sum + (r.stage.questions?.length || 0), 
      0
    );
    const questionsAnsweredWell = completedInterviews.reduce(
      (sum, r) => sum + (r.stage.questions?.filter(q => q.answeredWell === true).length || 0),
      0
    );
    
    return {
      totalInterviews: completedInterviews.length,
      upcomingInterviews: allInterviews.filter(r => r.stage.status === 'upcoming').length,
      totalQuestions,
      questionsAnsweredWell,
      companies: new Set(allInterviews.map(r => r.job.companyName)).size,
    };
  }, [allInterviews]);

  const getStatusBadge = (status: InterviewStage['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">已完成</Badge>;
      case 'upcoming':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">待进行</Badge>;
      case 'skipped':
        return <Badge variant="secondary">已跳过</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalInterviews}</div>
            <div className="text-sm text-muted-foreground">已完成面试</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.upcomingInterviews}</div>
            <div className="text-sm text-muted-foreground">待进行面试</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.totalQuestions}</div>
            <div className="text-sm text-muted-foreground">记录问题</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.companies}</div>
            <div className="text-sm text-muted-foreground">面试公司</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索公司、职位或问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="upcoming">待进行</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">暂无面试记录</p>
                <p className="text-sm text-muted-foreground mt-1">
                  在Job Board添加职位并记录面试内容
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInterviews.map(({ job, stage }) => {
              const isExpanded = expandedId === `${job.id}-${stage.id}`;
              const questionCount = stage.questions?.length || 0;
              const goodAnswers = stage.questions?.filter(q => q.answeredWell === true).length || 0;
              const badAnswers = stage.questions?.filter(q => q.answeredWell === false).length || 0;
              
              return (
                <div key={`${job.id}-${stage.id}`} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-2 top-4 w-5 h-5 rounded-full border-2 bg-background',
                    stage.status === 'completed' && 'border-emerald-500',
                    stage.status === 'upcoming' && 'border-amber-500',
                    stage.status === 'skipped' && 'border-muted',
                  )} />

                  <Collapsible open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : `${job.id}-${stage.id}`)}>
                    <Card className={cn(
                      'transition-all',
                      isExpanded && 'ring-1 ring-primary/20'
                    )}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold">{job.companyName}</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground">{job.roleTitle}</span>
                              </div>
                              
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-medium">{stage.name}</span>
                                {getStatusBadge(stage.status)}
                                
                                {stage.scheduledTime && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(stage.scheduledTime), 'MM/dd HH:mm')}
                                  </div>
                                )}
                                
                                {questionCount > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <MessageSquare className="w-3 h-3 text-primary" />
                                    <span>{questionCount}题</span>
                                    {goodAnswers > 0 && (
                                      <span className="flex items-center gap-0.5 text-emerald-600">
                                        <ThumbsUp className="w-3 h-3" />{goodAnswers}
                                      </span>
                                    )}
                                    {badAnswers > 0 && (
                                      <span className="flex items-center gap-0.5 text-red-500">
                                        <ThumbsDown className="w-3 h-3" />{badAnswers}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {stage.reflection && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Lightbulb className="w-3 h-3 text-amber-500" />
                                    <span>{REFLECTION_FEELINGS[stage.reflection.overallFeeling]?.emoji}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4 border-t">
                          <div className="pt-4 space-y-4">
                            {/* Questions Preview */}
                            {stage.questions && stage.questions.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-primary" />
                                  面试问题
                                </h4>
                                <div className="space-y-2">
                                  {stage.questions.slice(0, 3).map(q => (
                                    <div key={q.id} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
                                      <Badge variant="outline" className="text-xs shrink-0">
                                        {QUESTION_CATEGORIES[q.category]?.label}
                                      </Badge>
                                      <span className="flex-1">{q.question}</span>
                                      {q.answeredWell === true && <ThumbsUp className="w-4 h-4 text-emerald-500 shrink-0" />}
                                      {q.answeredWell === false && <ThumbsDown className="w-4 h-4 text-red-500 shrink-0" />}
                                    </div>
                                  ))}
                                  {stage.questions.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      还有 {stage.questions.length - 3} 个问题...
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Reflection Preview */}
                            {stage.reflection && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-amber-500" />
                                  反思总结
                                </h4>
                                <div className="grid gap-2 text-sm">
                                  {stage.reflection.keyTakeaways.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {stage.reflection.keyTakeaways.map((t, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {t}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Action */}
                            <div className="flex justify-end pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                className="gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
