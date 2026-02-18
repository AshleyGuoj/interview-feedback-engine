import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileSearch, Brain, TrendingUp, Sparkles } from "lucide-react";

const LOADING_STEPS = [
  { icon: FileSearch, key: "scanHistory" },
  { icon: Brain, key: "detectSignals" },
  { icon: TrendingUp, key: "mapMomentum" },
  { icon: Sparkles, key: "composeInsights" },
];

export function TimelineLoadingState() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card py-16">
      <div className="flex flex-col items-center gap-6">
        {/* Simple spinner */}
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-muted-foreground animate-pulse" />
        </div>

        <div className="space-y-4 text-center">
          <h3 className="text-[15px] font-semibold text-foreground">{t('timeline.loadingTitle')}</h3>
          <div className="space-y-2">
            {LOADING_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div
                  key={step.key}
                  className={`flex items-center justify-center gap-2 text-[13px] transition-all duration-300 ${
                    isActive
                      ? "text-foreground font-medium"
                      : isComplete
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "animate-pulse" : ""}`} />
                  {t(`timeline.loading_${step.key}`)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal progress */}
        <div className="w-48 h-0.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground/20 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
          />
        </div>

        <p className="text-[12px] text-muted-foreground/60">{t('timeline.loadingHint')}</p>
      </div>
    </div>
  );
}
