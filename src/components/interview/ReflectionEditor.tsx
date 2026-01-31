import { InterviewReflection, REFLECTION_FEELINGS } from '@/types/job';
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

export function ReflectionEditor({ reflection, onChange, readOnly = false }: ReflectionEditorProps) {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          面试反思
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Overall Feeling */}
        <div className="space-y-2">
          <label className="text-sm font-medium">整体感觉</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(REFLECTION_FEELINGS).map(([key, config]) => (
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
                onClick={() => !readOnly && handleFeelingChange(key as InterviewReflection['overallFeeling'])}
                disabled={readOnly}
              >
                <span>{config.emoji}</span>
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* What Went Well */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            表现好的地方
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
              placeholder="每行一条，例如：&#10;- 项目经验讲述流畅&#10;- 技术问题回答准确"
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
            可以改进的地方
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
              placeholder="每行一条，例如：&#10;- 系统设计题思路不够清晰&#10;- 应该多问clarifying questions"
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
            关键收获
          </label>
          {readOnly ? (
            <div className="flex flex-wrap gap-2">
              {data.keyTakeaways.map((item, idx) => (
                <Badge key={idx} variant="secondary">{item}</Badge>
              ))}
            </div>
          ) : (
            <Textarea
              placeholder="每行一条，例如：&#10;- 这类公司更看重实际落地经验&#10;- 需要准备更多数据驱动的案例"
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
            面试官印象
          </label>
          {readOnly ? (
            data.interviewerVibe && <p className="text-sm text-muted-foreground">{data.interviewerVibe}</p>
          ) : (
            <Textarea
              placeholder="面试官的态度、风格、关注点等..."
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
            公司新认知
          </label>
          {readOnly ? (
            data.companyInsights && <p className="text-sm text-muted-foreground">{data.companyInsights}</p>
          ) : (
            <Textarea
              placeholder="面试中了解到的公司信息、团队情况、业务方向等..."
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
