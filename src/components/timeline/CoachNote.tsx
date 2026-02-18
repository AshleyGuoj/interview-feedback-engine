import { useTranslation } from 'react-i18next';

interface CoachNoteProps {
  note: string;
}

export function CoachNote({ note }: CoachNoteProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="space-y-2.5">
        <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">
          {t('timeline.careerCoach', 'Strategic Advisory')}
        </span>
        <p className="text-[13.5px] text-foreground leading-[1.7]">
          {note}
        </p>
      </div>
    </div>
  );
}
