'use client';

import { useState } from 'react';
import { randomInt, randomUnit } from '@/lib/random';
import type { RewardPrize } from '@/types/episodeAccess';

export const SPIN_MS = 3600;

const CONFETTI_COLORS = ['#F59E0B', '#8B5CF6', '#10B981', '#E50914', '#3B82F6', '#EC4899'];
const SECTOR_COLORS = ['#4F46E5', '#D97706', '#059669', '#DC2626', '#7C3AED', '#0284C7', '#DB2777', '#CA8A04'];
const RADIUS = 130;
const CENTER = 150;
const HUB_RADIUS = 40;

export const prizeLabel = (p: Pick<RewardPrize, 'type' | 'bonusCoins' | 'planDays'>) =>
  p.type === 'BONUS_COIN' ? `+${p.bonusCoins} Coin` : `+${p.planDays} ngày gói`;

/**
 * The rotation that leaves `index` under the top pointer after six more full turns. Slices start
 * at the pointer and run clockwise, so the wheel turns back by the slice centre.
 */
export function landingRotation(current: number, index: number, count: number): number {
  const slice = 360 / count;
  const centre = index * slice + slice / 2;
  return current + 360 * 6 + (360 - (current % 360)) + (360 - centre);
}

function drawParticles() {
  return Array.from({ length: 45 }, (_, i) => ({
    id: i,
    x: randomUnit() * 100,
    color: CONFETTI_COLORS[randomInt(0, CONFETTI_COLORS.length - 1)],
    delay: randomUnit() * 0.4,
    size: 6 + randomUnit() * 8,
  }));
}

export function ConfettiEffect() {
  const [particles] = useState(drawParticles);
  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}

/** The prizes as equal slices; the chances stay with the Admin, so slices do not show weights. */
export function SpinWheel({
  prizes,
  rotation,
  spinning,
  spinsLeft,
}: {
  prizes: RewardPrize[];
  rotation: number;
  spinning: boolean;
  spinsLeft: number;
}) {
  const slice = (2 * Math.PI) / prizes.length;
  return (
    <div className="relative flex justify-center">
      <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-md" />
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.9, 0.18, 1)` : 'none',
        }}
        className="w-64 h-64 sm:w-72 sm:h-72 will-change-transform"
      >
        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl select-none" aria-hidden="true">
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 8} fill="#1E1B4B" stroke="#6366F1" strokeWidth="4" />
          {prizes.map((p, idx) => {
            const start = idx * slice - Math.PI / 2;
            const end = (idx + 1) * slice - Math.PI / 2;
            const mid = (start + end) / 2;
            const tx = CENTER + RADIUS * 0.65 * Math.cos(mid);
            const ty = CENTER + RADIUS * 0.65 * Math.sin(mid);
            const path = [
              `M ${CENTER} ${CENTER}`,
              `L ${CENTER + RADIUS * Math.cos(start)} ${CENTER + RADIUS * Math.sin(start)}`,
              `A ${RADIUS} ${RADIUS} 0 ${slice > Math.PI ? 1 : 0} 1 ${CENTER + RADIUS * Math.cos(end)} ${CENTER + RADIUS * Math.sin(end)} Z`,
            ].join(' ');
            return (
              <g key={p.id}>
                <path d={path} fill={SECTOR_COLORS[idx % SECTOR_COLORS.length]} stroke="#0F172A" strokeWidth="2" />
                <text
                  x={tx}
                  y={ty}
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${(mid * 180) / Math.PI + 90}, ${tx}, ${ty})`}
                >
                  <>
                    <tspan x={tx} dy="-0.25em">{prizeLabel(p)}</tspan>
                    <tspan x={tx} dy="1.2em" fontSize="9">{p.chancePercent ?? 0}%</tspan>
                  </>
                </text>
              </g>
            );
          })}
          <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS} fill="#1E1B4B" stroke="#F59E0B" strokeWidth="3" />
        </svg>
      </div>
      {/* The hub does not turn with the wheel: it tells how many spins are left. */}
      <div
        aria-label={`Bạn còn ${spinsLeft} lượt quay`}
        className="absolute inset-0 m-auto w-[28%] h-[28%] rounded-full flex flex-col items-center justify-center text-center leading-none select-none pointer-events-none"
      >
        <span className="text-[9px] sm:text-[10px] font-semibold text-purple-200">Bạn còn</span>
        <span className="text-xl sm:text-2xl font-black text-amber-400 my-0.5">{spinsLeft}</span>
        <span className="text-[9px] sm:text-[10px] font-semibold text-purple-200">lượt</span>
      </div>
    </div>
  );
}
