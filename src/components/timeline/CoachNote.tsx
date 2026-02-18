import { useTranslation } from 'react-i18next';

interface CoachNoteProps {
  note: string;
}

export function CoachNote({ note }: CoachNoteProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl surface-insight p-5 h-full">
      <span className="text-[11px] font-medium text-primary/60 uppercase tracking-[0.06em]">
        {t('timeline.careerCoach', 'Strategic Advisory')}
      </span>
      <p className="text-[13.5px] text-foreground leading-[1.75] mt-2.5">
        {note}
      </p>
    </div>
  );
}
