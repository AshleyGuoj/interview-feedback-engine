import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CareerSignalTimeline } from '@/components/timeline/CareerSignalTimeline';

export default function Timeline() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-[960px]">
        {/* Page Header — premium, restrained */}
        <div className="mb-8">
          <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.03em] leading-tight text-foreground">
            {t('timeline.title')}
          </h1>
          <p className="text-[15px] text-muted-foreground mt-2 leading-relaxed">
            {t('timeline.subtitle')}
          </p>
        </div>

        <CareerSignalTimeline />
      </div>
    </DashboardLayout>
  );
}
