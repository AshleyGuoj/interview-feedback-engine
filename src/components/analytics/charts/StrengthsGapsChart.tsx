import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { BarChartData } from '@/types/career-growth';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface StrengthsGapsChartProps {
  data: BarChartData;
}

export function StrengthsGapsChart({ data }: StrengthsGapsChartProps) {
  if (!data || (!data.strengths?.length && !data.gaps?.length)) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        暂无优劣势数据
      </div>
    );
  }

  // Combine strengths and gaps into one dataset
  // Strengths will be positive, gaps will be "positive but visually distinguished"
  const chartData = [
    ...(data.strengths || []).map(s => ({
      competency: s.competency,
      score: s.score,
      type: 'strength' as const,
    })),
    ...(data.gaps || []).map(g => ({
      competency: g.competency,
      score: g.score,
      type: 'gap' as const,
    })),
  ].sort((a, b) => b.score - a.score);

  const chartConfig: ChartConfig = {
    score: {
      label: '分数',
    },
  };

  const getBarColor = (type: 'strength' | 'gap') => {
    return type === 'strength' 
      ? 'hsl(var(--primary))'
      : 'hsl(var(--muted-foreground))';
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-muted-foreground">优势</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-muted-foreground" />
          <span className="text-muted-foreground">短板</span>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[0, 5]} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="competency" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ReferenceLine x={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <p className="text-xs text-center text-muted-foreground">
        虚线标记 3 分为及格线
      </p>
    </div>
  );
}
