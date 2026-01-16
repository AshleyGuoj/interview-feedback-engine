import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Brain, FileSearch, Target, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

const LOADING_STEPS = [
  { icon: FileSearch, label: "Reading your interview notes..." },
  { icon: Brain, label: "Analyzing interviewer signals..." },
  { icon: Target, label: "Evaluating performance gaps..." },
  { icon: Lightbulb, label: "Generating actionable insights..." },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-border/50 shadow-xl">
      <CardContent className="py-16">
        <div className="flex flex-col items-center gap-8">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full gradient-primary opacity-20 animate-ping" />
            <div className="relative p-6 rounded-full gradient-primary shadow-glow">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          {/* Loading Steps */}
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Analyzing Your Interview</h3>
            <div className="space-y-3">
              {LOADING_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                      isActive
                        ? "text-primary font-medium scale-105"
                        : isComplete
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />
                    {step.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground">This usually takes 10-20 seconds</p>
        </div>
      </CardContent>
    </Card>
  );
}
