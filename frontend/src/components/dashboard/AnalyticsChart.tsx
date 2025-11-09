import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AnalyticsChartProps {
  data?: Array<{ date: string; score: number }>;
}

const defaultData = [
  { time: "Mon", score: 65 },
  { time: "Tue", score: 72 },
  { time: "Wed", score: 68 },
  { time: "Thu", score: 78 },
  { time: "Fri", score: 82 },
  { time: "Sat", score: 75 },
  { time: "Sun", score: 85 },
];

export const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  // Transform data if provided
  let chartData = defaultData;
  if (data && data.length > 0) {
    // Group by date and calculate average
    const grouped = data.reduce((acc: any, item) => {
      const date = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (!acc[date]) {
        acc[date] = { time: date, scores: [] };
      }
      acc[date].scores.push(item.score);
      return acc;
    }, {});

    chartData = Object.values(grouped).map((item: any) => ({
      time: item.time,
      score: Math.round(item.scores.reduce((a: number, b: number) => a + b, 0) / item.scores.length)
    }));
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={{ fill: "hsl(var(--primary))", r: 4 }}
          activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
