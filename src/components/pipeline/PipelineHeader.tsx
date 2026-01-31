import { InterviewPipeline, RISK_TAG_CONFIG, RiskTag } from '@/types/interview-pipeline';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  User, 
  MapPin, 
  Briefcase, 
  Calendar, 
  TrendingUp,
  Clock,
  Flag,
  DollarSign,
  Mail,
  Phone,
  Linkedin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PipelineHeaderProps {
  pipeline: InterviewPipeline;
}

export function PipelineHeader({ pipeline }: PipelineHeaderProps) {
  const completedStages = pipeline.stages.filter(s => s.status === 'completed').length;
  const totalStages = pipeline.stages.length;
  const progressPercent = Math.round((completedStages / totalStages) * 100);

  const getOverallStatusBadge = () => {
    switch (pipeline.overallStatus) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">进行中</Badge>;
      case 'on_hold':
        return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">暂停</Badge>;
      case 'closed_positive':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">成功入职</Badge>;
      case 'closed_negative':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">已关闭</Badge>;
    }
  };

  const renderRiskTags = (tags?: RiskTag[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => {
          const config = RISK_TAG_CONFIG[tag];
          return (
            <Badge 
              key={tag} 
              variant="outline" 
              className={cn(
                'text-xs font-medium gap-1',
                config.color === 'red' && 'border-red-300 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-900/20',
                config.color === 'orange' && 'border-orange-300 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:bg-orange-900/20',
                config.color === 'yellow' && 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:bg-yellow-900/20',
                config.color === 'purple' && 'border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:bg-purple-900/20',
              )}
            >
              <Flag className="w-3 h-3" />
              {config.labelZh}
            </Badge>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Position & Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: Position Info */}
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">{pipeline.companyName}</h2>
                  <p className="text-lg text-muted-foreground">{pipeline.roleTitle}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {pipeline.department && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {pipeline.department}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {pipeline.location === 'CN' ? '中国' : pipeline.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Risk Tags */}
              <div className="flex items-center gap-3 flex-wrap">
                {getOverallStatusBadge()}
                {renderRiskTags(pipeline.globalRiskTags)}
              </div>
            </div>

            {/* Right: Progress & Stats */}
            <div className="lg:w-64 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">流程进度</span>
                  <span className="font-medium">{completedStages} / {totalStages} 阶段</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    流程天数
                  </div>
                  <p className="font-semibold text-lg">{pipeline.daysInPipeline || 0}天</p>
                </div>
                {pipeline.conversionProbability !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="w-3.5 h-3.5" />
                      转化概率
                    </div>
                    <p className="font-semibold text-lg text-emerald-600">
                      {Math.round(pipeline.conversionProbability * 100)}%
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  申请于 {new Date(pipeline.appliedAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Candidate Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">{pipeline.candidate.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pipeline.candidate.currentTitle} @ {pipeline.candidate.currentCompany}
                </p>
              </div>
            </div>

            {/* Contact & Details */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <a href={`mailto:${pipeline.candidate.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">{pipeline.candidate.email}</span>
                </a>
                {pipeline.candidate.phone && (
                  <a href={`tel:${pipeline.candidate.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">{pipeline.candidate.phone}</span>
                  </a>
                )}
                {pipeline.candidate.linkedInUrl && (
                  <a href={pipeline.candidate.linkedInUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Salary Expectation */}
              {pipeline.candidate.salaryExpectation && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {pipeline.candidate.salaryExpectation.min/1000}k - {pipeline.candidate.salaryExpectation.max/1000}k {pipeline.candidate.salaryExpectation.currency}/月
                  </span>
                </div>
              )}

              {/* Experience & Notice */}
              <div className="flex items-center gap-3 text-muted-foreground">
                {pipeline.candidate.yearsOfExperience && (
                  <span>{pipeline.candidate.yearsOfExperience}年经验</span>
                )}
                {pipeline.candidate.noticePeriod && (
                  <span>离职期: {pipeline.candidate.noticePeriod}</span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {pipeline.candidate.tags && pipeline.candidate.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              {pipeline.candidate.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
