import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RadarChartData } from '@/types/career-growth';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface CompetencyRadarChartProps {
  data: RadarChartData;
}

export function CompetencyRadarChart({ data }: CompetencyRadarChartProps) {
  if (!data || (!data.pastAverage && !data.currentAverage)) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        暂无对比数据
      </div>
    );
  }

  // Get all competencies from both past and current
  const allCompetencies = [
    ...new Set([
      ...Object.keys(data.pastAverage || {}),
      ...Object.keys(data.currentAverage || {}),
    ]),
  ];

  // Transform data for recharts
  const chartData = allCompetencies.map(competency => ({
    competency,
    past: data.pastAverage?.[competency] || 0,
    current: data.currentAverage?.[competency] || 0,
  }));

  const chartConfig: ChartConfig = {
    past: {
      label: '过去平均',
      color: 'hsl(var(--muted-foreground))',
    },
    current: {
      label: '当前状态',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis 
            dataKey="competency" 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 5]} 
            tick={{ fontSize: 10 }}
            tickCount={6}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar
            name="过去平均"
            dataKey="past"
            stroke="hsl(var(--muted-foreground))"
            fill="hsl(var(--muted-foreground))"
            fillOpacity={0.2}
            strokeDasharray="5 5"
          />
          <Radar
            name="当前状态"
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
            iconSize={8}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
