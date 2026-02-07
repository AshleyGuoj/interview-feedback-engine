import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { CareerGrowthPanel } from '@/components/analytics/CareerGrowthPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Trophy, 
  History, 
  Archive as ArchiveIcon, 
  LineChart, 
  Lock,
  Building2,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

export default function Archive() {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState<'growth' | 'history'>('growth');

  // Filter closed jobs for the history tab
  const closedJobs = jobs.filter(job => job.status === 'closed');

  // Check total analyzed rounds across all jobs for career growth unlock
  const totalAnalyzedRounds = jobs.reduce((count, job) => {
    return count + job.stages.filter(
      s => s.status === 'completed' && (s.questions?.length || s.reflection)
    ).length;
  }, 0);
  const isGrowthUnlocked = totalAnalyzedRounds >= 2;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Page Header */}
        <div className="shrink-0 px-6 py-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Career Growth & Archive</h1>
              <p className="text-sm text-muted-foreground">
                回顾你的职业成长轨迹，从过去的经验中汲取智慧
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="shrink-0 border-b px-6">
          <Tabs value={activeTab} onValueChange={(v) => {
            if (v === 'growth' && !isGrowthUnlocked) return;
            setActiveTab(v as 'growth' | 'history');
          }}>
            <TabsList className="h-12 bg-transparent p-0 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={!isGrowthUnlocked ? 'cursor-not-allowed' : ''}>
                      <TabsTrigger 
                        value="growth" 
                        disabled={!isGrowthUnlocked}
                        className={`data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3 ${!isGrowthUnlocked ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {!isGrowthUnlocked ? (
                          <Lock className="w-4 h-4 mr-2" />
                        ) : (
                          <LineChart className="w-4 h-4 mr-2" />
                        )}
                        Career Growth
                        {isGrowthUnlocked && (
                          <span className="ml-2 text-xs text-primary">✨</span>
                        )}
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  {!isGrowthUnlocked && (
                    <TooltipContent>
                      <p>需要至少 2 轮面试分析数据</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
              >
                <History className="w-4 h-4 mr-2" />
                Closed Applications
                {closedJobs.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {closedJobs.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          {activeTab === 'growth' ? (
            isGrowthUnlocked ? (
              <div className="max-w-4xl mx-auto">
                <CareerGrowthPanel jobs={jobs} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold mb-3">Career Growth 尚未解锁</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    完成至少 2 轮面试分析后，系统将自动生成你的职业成长趋势分析。
                    当前已分析: {totalAnalyzedRounds} 轮
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="p-6">
              {closedJobs.length > 0 ? (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Closed Date</TableHead>
                        <TableHead>Rounds</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closedJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.roleTitle}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              {job.companyName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              {job.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(job.updatedAt), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {job.stages.filter(s => s.status === 'completed').length} completed
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {job.jobLink && (
                              <a
                                href={job.jobLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-16 text-center">
                    <ArchiveIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-lg mb-2">No Closed Applications</CardTitle>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      When you close job applications, they'll appear here for future reference
                      and to help you learn from past experiences.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
