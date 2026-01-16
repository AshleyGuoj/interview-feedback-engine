import { Sparkles, Target, TrendingUp, FileCheck } from "lucide-react";

export function HeroSection() {
  return (
    <div className="text-center space-y-6 mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
        <Sparkles className="h-4 w-4" />
        AI-Powered Interview Coach
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
        Turn Every Interview Into a{" "}
        <span className="text-gradient">Career Asset</span>
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        Get actionable feedback on your interview performance. Identify strengths, 
        gaps, and exactly how to prepare for the next round.
      </p>

      <div className="flex flex-wrap justify-center gap-6 pt-4">
        <Feature icon={Target} label="Performance Analysis" />
        <Feature icon={FileCheck} label="Resume Alignment" />
        <Feature icon={TrendingUp} label="Preparation Strategy" />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Target; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="p-1.5 rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      {label}
    </div>
  );
}
