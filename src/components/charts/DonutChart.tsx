'use client';

import { useState } from 'react';

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

export function DonutChart({
  data,
  size = 200,
  thickness = 24,
  centerLabel,
  centerValue,
  showLegend = true,
  valueUnit = '',
}: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const validData = data.filter((d) => d.value > 0);
  const total = validData.reduce((acc, d) => acc + d.value, 0);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate segment angles & dash arrays
  let accumulatedAngle = 0;
  const segments = validData.map((item, idx) => {
    const fraction = total > 0 ? item.value / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * (circumference / 360);
    accumulatedAngle += fraction * 360;

    return {
      ...item,
      fraction,
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* ── Donut SVG ── */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          aria-hidden="true"
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center transition-transform"
        >
          {/* Background base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={thickness}
            className="text-slate-100 dark:text-white/[0.06]"
          />

          {total === 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={thickness}
              strokeDasharray="4 4"
              className="text-slate-300 dark:text-white/20"
            />
          ) : (
            segments.map((seg) => {
              const isHovered = hoveredIdx === seg.idx;
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? thickness + 4 : thickness}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(seg.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })
          )}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {hoveredIdx !== null && validData[hoveredIdx] ? (
            <>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                {validData[hoveredIdx].label}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {validData[hoveredIdx].value.toLocaleString('vi-VN')} {valueUnit}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                {Math.round((validData[hoveredIdx].value / (total || 1)) * 100)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {centerValue !== undefined ? centerValue : total.toLocaleString('vi-VN')}
              </span>
              {centerLabel && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {centerLabel}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      {showLegend && (
        <div className="flex flex-col gap-2 w-full max-w-[220px]">
          {data.map((item, idx) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isHovered
                    ? 'bg-slate-100 dark:bg-white/10'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2 font-mono">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.value.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-slate-400 text-[10px] w-8 text-right">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
