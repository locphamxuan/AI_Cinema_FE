'use client';

import { useId } from 'react';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/shadcn/chart';

export interface BarSeries {
  name: string;
  color: string;
  values: number[];
}

interface BarChartProps {
  categories: string[];
  series: BarSeries[];
  height?: number;
  valueUnit?: string;
  formatValue?: (val: number) => string;
}

const compact = new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Grouped bars, one group per category; hovering a group shows every series' value. */
export function BarChart({
  categories,
  series,
  height = 240,
  valueUnit = '',
  formatValue = (v) => v.toLocaleString('vi-VN'),
}: BarChartProps) {
  const gid = useId().replace(/:/g, '');
  const keys = series.map((_, i) => `s${i}`);
  const config = Object.fromEntries(
    series.map((s, i) => [keys[i], { label: s.name, color: s.color }]),
  ) satisfies ChartConfig;
  const rows = categories.map((category, c) =>
    Object.fromEntries([['category', category], ...series.map((s, i) => [keys[i], s.values[c] ?? 0])]),
  );

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height }}>
        Chưa có số liệu trong khoảng này.
      </div>
    );
  }

  const chart = (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <RechartsBarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="24%">
        <defs>
          {keys.map((key) => (
            <linearGradient key={key} id={`${gid}-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--color-${key})`} stopOpacity={1} />
              <stop offset="100%" stopColor={`var(--color-${key})`} stopOpacity={0.45} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          tickFormatter={(name: string) => (categories.length > 4 && name.length > 10 ? `${name.slice(0, 9)}…` : name)}
        />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => compact.format(v)} />
        <ChartTooltip
          cursor={{ fillOpacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => <span className="font-medium">{String(label)}</span>}
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{config[name as string]?.label ?? name}</span>
                  <span className="font-medium tabular-nums text-foreground">
                    {formatValue(Number(value))}
                    {valueUnit && ` ${valueUnit}`}
                  </span>
                </div>
              )}
            />
          }
        />
        {keys.map((key) => (
          <Bar key={key} dataKey={key} fill={`url(#${gid}-${key})`} radius={[6, 6, 0, 0]} maxBarSize={44} />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );

  return series.length > 1 ? (
    <div className="space-y-3">
      {chart}
      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    chart
  );
}
