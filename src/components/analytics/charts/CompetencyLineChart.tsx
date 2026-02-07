import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LineChartData } from '@/types/career-growth';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

interface CompetencyLineChartProps {
  data: LineChartData[];
}

// Color palette for different competencies
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1, 221 83% 53%))',
  'hsl(var(--chart-2, 142 71% 45%))',
  'hsl(var(--chart-3, 47 96% 53%))',
  'hsl(var(--chart-4, 280 87% 65%))',
  'hsl(var(--chart-5, 12 76% 61%))',
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(339, 86%, 59%)',
  'hsl(172, 66%, 50%)',
];

export function CompetencyLineChart({ data }: CompetencyLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        暂无趋势数据
      </div>
    );
  }

  // Transform data for recharts - pivot from competency-centric to time-centric
  const allDates = [...new Set(data.flatMap(d => d.data.map(p => p.x)))].sort();
  
  const chartData = allDates.map(date => {
    const point: Record<string, string | number> = { date };
    data.forEach(competency => {
      const match = competency.data.find(p => p.x === date);
      if (match) {
        point[competency.competency] = match.y;
      }
    });
    return point;
  });

  // Build chart config for each competency
  const chartConfig: ChartConfig = {};
  data.forEach((d, i) => {
    chartConfig[d.competency] = {
      label: d.competency,
      color: COLORS[i % COLORS.length],
    };
  });

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 5]} 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
            iconSize={8}
          />
          {data.map((competency, i) => (
            <Line
              key={competency.competency}
              type="monotone"
              dataKey={competency.competency}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
