import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { InterviewTimeline } from '@/components/jobs/InterviewTimeline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  Sparkles,
  MapPin,
  Building2,
  Link as LinkIcon
} from 'lucide-react';
import { Job, InterviewStage } from '@/types/job';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// This would come from state/database in a real app
const getJobById = (id: string): Job | null => {
  const jobs: Job[] = [
    {
      id: '1',
      companyName: 'Google',
      roleTitle: 'Senior Product Manager',
      location: 'US',
      status: 'interviewing',
      jobLink: 'https://careers.google.com/jobs/results/123',
      source: 'linkedin',
      interestLevel: 5,
      careerFitNotes: 'Great fit for my background in consumer products. Strong engineering culture and clear PM career path. Would give me exposure to AI/ML products.',
      currentStage: 'Round 2',
      nextAction: 'Prepare case study',
      stages: [
        { 
          id: 's1', 
          name: 'Applied', 
          status: 'completed', 
          date: '2024-01-10',
          postReview: {
            summary: 'Successfully submitted application with tailored resume.',
            strengths: ['Highlighted relevant PM experience'],
            risks: [],
            signals: [],
            nextSteps: ['Wait for HR response']
          }
        },
        { 
          id: 's2', 
          name: 'HR Screen', 
          status: 'completed', 
          date: '2024-01-15',
          interviewLog: {
            interviewers: ['Sarah Chen'],
            format: 'phone',
            questionsAsked: ['Walk me through your background', 'Why Google?', 'Salary expectations'],
            topicsCovered: ['Background', 'Motivation', 'Logistics']
          },
          postReview: {
            summary: 'Positive HR screen. Recruiter seemed engaged and moved quickly to next steps.',
            strengths: ['Clear articulation of career goals', 'Good culture fit signals'],
            risks: ['Salary expectations might be on higher end'],
            signals: ['Recruiter mentioned fast-track process'],
            nextSteps: ['Prepare for Round 1 technical']
          }
        },
        { 
          id: 's3', 
          name: 'Round 1', 
          status: 'completed', 
          date: '2024-01-22',
          interviewLog: {
            interviewers: ['Mike Johnson', 'Lisa Wang'],
            format: 'zoom',
            questionsAsked: ['Product sense: How would you improve Google Maps?', 'Tell me about a time you handled conflict'],
            topicsCovered: ['Product sense', 'Behavioral', 'Leadership']
          },
          postReview: {
            summary: 'Solid Round 1. Product sense question went well, behavioral could have been stronger.',
            strengths: ['Structured approach to product question', 'Good metrics framework'],
            risks: ['Behavioral answer was too long', 'Could have shown more leadership examples'],
            signals: ['Both interviewers nodded positively', 'Ran slightly over time due to good discussion'],
            nextSteps: ['Practice more concise behavioral stories', 'Prepare case study examples']
          }
        },
        { 
          id: 's4', 
          name: 'Round 2', 
          status: 'upcoming',
          preparation: {
            notes: 'Focus on product strategy and execution questions. Review Google\'s recent product launches.',
            stories: ['Slack feature launch', 'Data platform migration'],
            questions: ['What does success look like for this role?', 'How do PMs work with engineering here?']
          }
        },
        { id: 's5', name: 'Final Round', status: 'upcoming' },
        { id: 's6', name: 'Offer Discussion', status: 'upcoming' },
      ],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-22',
    },
  ];
  return jobs.find(j => j.id === id) || null;
};

const sourceLabels: Record<string, string> = {
  linkedin: 'LinkedIn',
  boss: 'BOSS直聘',
  referral: 'Referral',
  website: 'Company Website',
  other: 'Other',
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const job = getJobById(id || '');
  const [stages, setStages] = useState<InterviewStage[]>(job?.stages || []);

  if (!job) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Job not found</p>
          <Button variant="ghost" onClick={() => navigate('/jobs')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Board
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStageUpdate = (stageId: string, updates: Partial<InterviewStage>) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, ...updates } : s));
  };

  const handleAIAction = (action: 'summarize' | 'suggest-prep' | 'extract-insights', stageId?: string) => {
    toast.info(`AI ${action} feature coming soon!`);
  };

  const locationColors: Record<string, string> = {
    CN: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    US: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Remote: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Job Board
        </Button>

        {/* Job Overview Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{job.companyName}</CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={cn('text-xs font-medium', locationColors[job.location])}
                  >
                    <MapPin className="w-3 h-3 mr-1" />
                    {job.location}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">{job.roleTitle}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-primary hover:text-primary"
                onClick={() => handleAIAction('extract-insights')}
              >
                <Sparkles className="w-4 h-4" />
                Extract insights
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {/* Source */}
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  Source
                </p>
                <p className="font-medium">{sourceLabels[job.source]}</p>
              </div>
              
              {/* Job Link */}
              {job.jobLink && (
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Job Link
                  </p>
                  <a 
                    href={job.jobLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    View posting
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Interest Level */}
              <div className="space-y-1">
                <p className="text-muted-foreground">Interest Level</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Star
                      key={level}
                      className={cn(
                        'w-4 h-4',
                        level <= job.interestLevel
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Career Fit Notes */}
            {job.careerFitNotes && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Career Fit Notes</p>
                <p className="text-sm">{job.careerFitNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interview Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Interview Timeline</h2>
          <InterviewTimeline 
            stages={stages}
            onStageUpdate={handleStageUpdate}
            onAIAction={handleAIAction}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
