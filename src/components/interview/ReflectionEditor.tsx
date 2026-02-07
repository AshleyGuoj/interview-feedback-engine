import { useTranslation } from 'react-i18next';
import { InterviewReflection } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle2,
  Building2,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReflectionEditorProps {
  reflection: InterviewReflection | undefined;
  onChange: (reflection: InterviewReflection) => void;
  readOnly?: boolean;
}

const emptyReflection: InterviewReflection = {
  overallFeeling: 'neutral',
  whatWentWell: [],
  whatCouldImprove: [],
  keyTakeaways: [],
};

// Feeling config with emojis and colors
const FEELING_CONFIG = {
  great: { emoji: '🎉', color: 'emerald' },
  good: { emoji: '😊', color: 'green' },
  neutral: { emoji: '😐', color: 'gray' },
  poor: { emoji: '😔', color: 'orange' },
  bad: { emoji: '😢', color: 'red' },
} as const;

export function ReflectionEditor({ reflection, onChange, readOnly = false }: ReflectionEditorProps) {
  const { t } = useTranslation();
  const data = reflection || emptyReflection;

  const handleFeelingChange = (feeling: InterviewReflection['overallFeeling']) => {
    onChange({ ...data, overallFeeling: feeling });
  };

  const handleArrayChange = (field: keyof Pick<InterviewReflection, 'whatWentWell' | 'whatCouldImprove' | 'keyTakeaways' | 'surprisingQuestions' | 'followUpActions'>, value: string) => {
    const items = value.split('\n').filter(s => s.trim());
    onChange({ ...data, [field]: items });
  };

  const handleTextChange = (field: keyof Pick<InterviewReflection, 'interviewerVibe' | 'companyInsights'>, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const getFeelingLabel = (feeling: keyof typeof FEELING_CONFIG) => {
    const labelMap: Record<string, string> = {
      great: t('reflection.feelingGreat'),
      good: t('reflection.feelingGood'),
      neutral: t('reflection.feelingNeutral'),
      poor: t('reflection.feelingPoor'),
      bad: t('reflection.feelingBad'),
    };
    return labelMap[feeling];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          {t('reflection.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Overall Feeling */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('reflection.overallFeeling')}</label>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(FEELING_CONFIG) as Array<keyof typeof FEELING_CONFIG>).map((key) => {
              const config = FEELING_CONFIG[key];
              return (
                <Button
                  key={key}
                  variant={data.overallFeeling === key ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'gap-1.5',
                    data.overallFeeling === key && config.color === 'emerald' && 'bg-emerald-600 hover:bg-emerald-700',
                    data.overallFeeling === key && config.color === 'green' && 'bg-green-600 hover:bg-green-700',
                    data.overallFeeling === key && config.color === 'orange' && 'bg-orange-600 hover:bg-orange-700',
                    data.overallFeeling === key && config.color === 'red' && 'bg-red-600 hover:bg-red-700',
                  )}
                  onClick={() => !readOnly && handleFeelingChange(key)}
                  disabled={readOnly}
                >
                  <span>{config.emoji}</span>
                  {getFeelingLabel(key)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* What Went Well */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            {t('reflection.whatWentWell')}
          </label>
          {readOnly ? (
            <div className="space-y-1">
              {data.whatWentWell.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <Textarea
              placeholder={t('reflection.whatWentWellPlaceholder')}
              value={data.whatWentWell.join('\n')}
              onChange={(e) => handleArrayChange('whatWentWell', e.target.value)}
              rows={3}
              className="text-sm"
            />
          )}
        </div>

        {/* What Could Improve */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-500" />
            {t('reflection.whatCouldImprove')}
          </label>
          {readOnly ? (
            <div className="space-y-1">
              {data.whatCouldImprove.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <Textarea
              placeholder={t('reflection.whatCouldImprovePlaceholder')}
              value={data.whatCouldImprove.join('\n')}
              onChange={(e) => handleArrayChange('whatCouldImprove', e.target.value)}
              rows={3}
              className="text-sm"
            />
          )}
        </div>

        {/* Key Takeaways */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            {t('reflection.keyTakeaways')}
          </label>
          {readOnly ? (
            <div className="flex flex-wrap gap-2">
              {data.keyTakeaways.map((item, idx) => (
                <Badge key={idx} variant="secondary">{item}</Badge>
              ))}
            </div>
          ) : (
            <Textarea
              placeholder={t('reflection.keyTakeawaysPlaceholder')}
              value={data.keyTakeaways.join('\n')}
              onChange={(e) => handleArrayChange('keyTakeaways', e.target.value)}
              rows={3}
              className="text-sm"
            />
          )}
        </div>

        {/* Interviewer Vibe */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            {t('reflection.interviewerVibe')}
          </label>
          {readOnly ? (
            data.interviewerVibe && <p className="text-sm text-muted-foreground">{data.interviewerVibe}</p>
          ) : (
            <Textarea
              placeholder={t('reflection.interviewerVibePlaceholder')}
              value={data.interviewerVibe || ''}
              onChange={(e) => handleTextChange('interviewerVibe', e.target.value)}
              rows={2}
              className="text-sm"
            />
          )}
        </div>

        {/* Company Insights */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-500" />
            {t('reflection.companyInsights')}
          </label>
          {readOnly ? (
            data.companyInsights && <p className="text-sm text-muted-foreground">{data.companyInsights}</p>
          ) : (
            <Textarea
              placeholder={t('reflection.companyInsightsPlaceholder')}
              value={data.companyInsights || ''}
              onChange={(e) => handleTextChange('companyInsights', e.target.value)}
              rows={2}
              className="text-sm"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
