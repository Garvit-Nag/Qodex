/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { TrendingUp, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TimelineData {
  date: string;
  count: number;
}

interface ActivityTimelineProps {
  data: TimelineData[];
}

export default function ActivityTimeline({ data }: ActivityTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No repository activity yet</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const totalRepos = data.reduce((sum, d) => sum + d.count, 0);

  const chartConfig = {
    count: {
      label: "Repositories",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const barWidth = 80;
  const gap = 40;
  const minChartWidth = Math.max(400, data.length * (barWidth + gap));

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
        <div style={{ width: `${minChartWidth}px`, minWidth: '100%' }}>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data}
                margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                barCategoryGap="20%" 
              >
                <CartesianGrid 
                  vertical={false} 
                  strokeDasharray="3 3"
                  stroke="rgba(148, 163, 184, 0.3)"
                />
                
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ 
                    fontSize: 12, 
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                />
                
                <YAxis
                  domain={[0, Math.max(5, Math.ceil(maxCount * 1.1))]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ 
                    fontSize: 12, 
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                />
                
                <ChartTooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  content={<ChartTooltipContent 
                    hideLabel={false}
                    formatter={(value, name) => [
                      `${value} repositories`,
                      "Uploaded"
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />}
                />
                
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60} 
                />
                
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
          <TrendingUp className="h-4 w-4 text-green-500" />
          Peak: {maxCount} repos in one day
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          Total: {totalRepos} repositories uploaded
        </div>
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thumb-purple-400::-webkit-scrollbar-thumb {
          background-color: #a855f7;
          border-radius: 3px;
        }
        .scrollbar-track-gray-200::-webkit-scrollbar-track {
          background-color: #e5e7eb;
          border-radius: 3px;
        }
        .dark .scrollbar-track-gray-700::-webkit-scrollbar-track {
          background-color: #374151;
        }
        .scrollbar-thumb-purple-400::-webkit-scrollbar-thumb:hover {
          background-color: #9333ea;
        }
      `}</style>
    </div>
  );
}