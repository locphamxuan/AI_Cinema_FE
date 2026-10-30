'use client';

import { useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/shadcn/chart';
import { cn } from '@/lib/utils';

export interface DonutDataPoint {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDataPoint[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  valueUnit?: string;
}

/** Share of a whole: a ring with the total in the middle and a legend that highlights its slice. */
export function DonutChart({
  data,
  size = 200,
  thickness = 24,
  centerLabel,
  centerValue,
  showLegend = true,
  valueUnit = '',
}: DonutChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const shown = data.filter((d) => d.value > 0);
  const total = shown.reduce((sum, d) => sum + d.value, 0);
  const config = Object.fromEntries(data.map((d) => [d.label, { label: d.label, color: d.color }])) satisfies ChartConfig;
  const share = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);
  const focus = active !== null ? data[active] : null;

  return (
    <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ChartContainer config={config} className="aspect-square size-full" initialDimension={{ width: size, height: size }}>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {Number(value).toLocaleString('vi-VN')}
                        {valueUnit && ` ${valueUnit}`}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={total > 0 ? shown : [{ label: 'empty', value: 1, color: 'var(--muted)' }]}
              dataKey="value"
              nameKey="label"
              innerRadius={size / 2 - thickness}
              outerRadius={size / 2 - 2}
              paddingAngle={shown.length > 1 ? 2 : 0}
              cornerRadius={4}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {(total > 0 ? shown : [{ color: 'var(--muted)', label: 'empty' }]).map((d) => (
                <Cell
                  key={d.label}
                  fill={d.color}
                  opacity={focus && focus.label !== d.label ? 0.35 : 1}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {focus ? (
            <>
              <span className="font-heading text-2xl font-semibold tabular-nums">{share(focus.value)}%</span>
              <span className="max-w-[60%] truncate text-xs text-muted-foreground">{focus.label}</span>
            </>
          ) : (
            <>
              <span className="font-heading text-2xl font-semibold tabular-nums">
                {centerValue !== undefined ? centerValue : total.toLocaleString('vi-VN')}
              </span>
              {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
            </>
          )}
        </div>
      </div>

      {showLegend && (
        <ul className="flex w-full max-w-[240px] flex-col gap-1">
          {data.map((item, idx) => (
            <li
              key={item.label}
              onMouseEnter={() => setActive(idx)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                'flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors',
                active === idx ? 'bg-muted' : 'hover:bg-muted/60',
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="ml-3 flex shrink-0 items-baseline gap-2 tabular-nums">
                <span className="font-medium">{item.value.toLocaleString('vi-VN')}</span>
                <span className="w-9 text-right text-xs text-muted-foreground">{share(item.value)}%</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
