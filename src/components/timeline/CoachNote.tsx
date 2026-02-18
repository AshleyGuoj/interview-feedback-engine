import { useTranslation } from 'react-i18next';

interface CoachNoteProps {
  bullets: string[];
  fallback: string;
}

export function CoachNote({ bullets, fallback }: CoachNoteProps) {
  const { t } = useTranslation();

  return (
    <div className="border-l border-border pl-5 py-1 h-full">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em]">
        {t('timeline.careerCoach', 'Strategic Guidance')}
      </span>
      <div className="mt-3 border-t border-border/50 pt-3">
        {bullets.length > 0 ? (
          <ul className="space-y-2.5">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0 mt-[8px]" />
                <p className="text-[13.5px] text-foreground leading-[1.65]">
                  {bullet.trim()}{bullet.trim().endsWith('.') || bullet.trim().endsWith('。') ? '' : '.'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13.5px] text-foreground leading-[1.7]">
            {fallback}
          </p>
        )}
      </div>
    </div>
  );
}
