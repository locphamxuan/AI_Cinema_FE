'use client';

import { useState } from 'react';

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

export function BarChart({
  categories,
  series,
  height = 240,
  valueUnit = '',
  formatValue = (v) => v.toLocaleString('vi-VN'),
}: BarChartProps) {
  const [hovered, setHovered] = useState<{ catIdx: number; serIdx: number } | null>(null);

  // Compute maximum value across all series
  const allValues = series.flatMap((s) => s.values);
  const rawMax = Math.max(...allValues, 1);
  // Round max up nicely
  const step = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const maxValue = Math.ceil(rawMax / step) * step;

  // Grid tick counts: 4 intervals
  const ticks = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];

  const chartPaddingTop = 20;
  const chartPaddingBottom = 40;
  const chartPaddingLeft = 45;
  const chartPaddingRight = 15;
  const plotHeight = height - chartPaddingTop - chartPaddingBottom;

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-slate-400 py-12">
        Chưa có dữ liệu biểu đồ.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── Series Legend ── */}
      {series.length > 1 && (
        <div className="flex items-center justify-end gap-4 text-xs">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── SVG Chart ── */}
      <div className="relative w-full" style={{ height }}>
        <svg width="100%" height={height} aria-hidden="true" className="overflow-visible">
          {/* Horizontal gridlines and Y-axis labels */}
          {ticks.map((t, idx) => {
            const y = chartPaddingTop + plotHeight - (t / maxValue) * plotHeight;
            return (
              <g key={idx}>
                <line
                  x1={chartPaddingLeft}
                  y1={y}
                  x2={`calc(100% - ${chartPaddingRight}px)`}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray={idx === 0 ? 'none' : '3 3'}
                  className="text-slate-200 dark:text-white/10"
                />
                <text
                  x={chartPaddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  {formatValue(t)}
                </text>
              </g>
            );
          })}

          {/* Bars grouped by Category */}
          {categories.map((cat, catIdx) => {
            const groupWidthFraction = 100 / categories.length;
            const groupCenterPercent = (catIdx + 0.5) * groupWidthFraction;
            const barCount = series.length;
            const barWidthPx = Math.min(28, Math.max(12, 120 / (categories.length * barCount)));
            const groupTotalWidth = barCount * barWidthPx + (barCount - 1) * 4;

            return (
              <g key={cat}>
                {series.map((ser, serIdx) => {
                  const val = ser.values[catIdx] ?? 0;
                  const barH = (val / maxValue) * plotHeight;
                  const barY = chartPaddingTop + plotHeight - barH;

                  // Center bars within the category slot
                  const offsetWithinGroup = serIdx * (barWidthPx + 4) - groupTotalWidth / 2;
                  const isHovered = hovered?.catIdx === catIdx && hovered?.serIdx === serIdx;

                  return (
                    <g key={ser.name}>
                      <rect
                        x={`calc(${groupCenterPercent}% + ${offsetWithinGroup}px)`}
                        y={barY}
                        width={barWidthPx}
                        height={Math.max(2, barH)}
                        rx={4}
                        fill={ser.color}
                        opacity={hovered && !isHovered ? 0.45 : 1}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHovered({ catIdx, serIdx })}
                        onMouseLeave={() => setHovered(null)}
                      />
                    </g>
                  );
                })}

                {/* X-axis category label */}
                <text
                  x={`${groupCenterPercent}%`}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-slate-600 dark:fill-slate-300 text-[11px] font-medium"
                >
                  {cat.length > 14 ? `${cat.slice(0, 12)}…` : cat}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hovered !== null && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-slate-900/90 dark:bg-black/90 text-white text-xs shadow-lg border border-white/10 backdrop-blur-md flex flex-col gap-0.5"
            style={{
              left: `${((hovered.catIdx + 0.5) / categories.length) * 100}%`,
              top: chartPaddingTop + 10,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="font-semibold text-slate-300">{categories[hovered.catIdx]}</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: series[hovered.serIdx].color }}
              />
              <span className="text-slate-400">{series[hovered.serIdx].name}:</span>
              <span className="font-bold text-white">
                {formatValue(series[hovered.serIdx].values[hovered.catIdx] ?? 0)} {valueUnit}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
