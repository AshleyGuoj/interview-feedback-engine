import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useJobs } from '@/contexts/JobsContext';
import { CareerGrowthPanel } from '@/components/analytics/CareerGrowthPanel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const { t } = useTranslation();
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState<'growth' | 'history'>('growth');

  // Filter closed jobs for the history tab
  const closedJobs = jobs.filter(job => job.status === 'closed');

  // Check total analyzed rounds across all jobs for career growth unlock
  const totalAnalyzedRounds = jobs.reduce((count, job) => {
    const seenIds = new Set<string>();
    let jobCount = 0;
    const countStages = (stages: typeof job.stages) => {
      stages.forEach(s => {
        if (!seenIds.has(s.id) && (s.questions?.length || s.reflection)) {
          seenIds.add(s.id);
          jobCount++;
        }
      });
    };
    if (job.stages) countStages(job.stages);
    if (job.pipelines) job.pipelines.forEach(p => { if (p.stages) countStages(p.stages); });
    return count + jobCount;
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
              <h1 className="text-xl font-semibold text-foreground">{t('careerGrowth.pageTitle')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('careerGrowth.pageSubtitle')}
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
                        {t('analytics.careerGrowth')}
                        {isGrowthUnlocked && (
                          <span className="ml-2 text-xs text-primary">✨</span>
                        )}
                      </TabsTrigger>
                    </span>
                  </TooltipTrigger>
                  {!isGrowthUnlocked && (
                    <TooltipContent>
                      <p>{t('careerGrowth.needsMinRounds')}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-3"
              >
                <History className="w-4 h-4 mr-2" />
                {t('careerGrowth.closedApplications')}
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
                  <h2 className="text-lg font-semibold mb-3">{t('careerGrowth.notUnlocked')}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('careerGrowth.notUnlockedDescription')}
                    {' '}{t('careerGrowth.currentlyAnalyzed')}: {totalAnalyzedRounds} {t('analytics.rounds')}
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
                        <TableHead>{t('jobs.role')}</TableHead>
                        <TableHead>{t('jobs.company')}</TableHead>
                        <TableHead>{t('jobs.location')}</TableHead>
                        <TableHead>{t('archive.closedDate')}</TableHead>
                        <TableHead>{t('analytics.rounds')}</TableHead>
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
                              {job.stages.filter(s => s.status === 'completed').length} {t('common.completed')}
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
                    <CardTitle className="text-lg mb-2">{t('careerGrowth.noClosedApplications')}</CardTitle>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {t('careerGrowth.closedAppDescription')}
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
