import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Sparkles } from 'lucide-react';

interface CoachNoteProps {
  note: string;
}

export function CoachNote({ note }: CoachNoteProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-primary">{t('timeline.careerCoach')}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {note}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
