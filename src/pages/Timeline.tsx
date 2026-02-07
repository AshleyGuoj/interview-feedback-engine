import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CareerSignalTimeline } from '@/components/timeline/CareerSignalTimeline';

export default function Timeline() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">{t('timeline.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('timeline.subtitle')}
          </p>
        </div>

        <CareerSignalTimeline />
      </div>
    </DashboardLayout>
  );
}
