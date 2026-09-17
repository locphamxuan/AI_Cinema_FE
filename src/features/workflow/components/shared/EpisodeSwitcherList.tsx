import { ReactNode } from 'react';
import { Clapperboard, Film } from 'lucide-react';
import type { EpisodePackage } from '@/types/workflow';
import { statusDotClass } from './StatusBadge';

const VARIANT_STYLES = {
  creator: {
    icon: Clapperboard,
    selected: 'bg-ruby/10 dark:bg-ruby/20 text-ruby border border-ruby/30 font-bold shadow-xs',
    unselected: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5',
    iconSelected: 'text-ruby',
    iconUnselected: 'text-slate-400 dark:text-slate-500',
  },
  reviewer: {
    icon: Film,
    selected: 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border-l-2 border-purple-600 font-semibold shadow-xs',
    unselected: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5',
    iconSelected: 'text-purple-600 dark:text-purple-400',
    iconUnselected: 'text-slate-400 dark:text-slate-500',
  },
} as const;

export interface EpisodeSwitcherListProps {
  episodes: EpisodePackage[];
  selectedId?: string;
  onSelect: (id: string) => void;
  variant: keyof typeof VARIANT_STYLES;
  renderSubtitle?: (episode: EpisodePackage) => ReactNode;
}

/** Left-sidebar "pick an episode" list — shared markup for the creator and reviewer dashboards (only the accent color/icon differ). */
export function EpisodeSwitcherList({ episodes, selectedId, onSelect, variant, renderSubtitle }: EpisodeSwitcherListProps) {
  const style = VARIANT_STYLES[variant];
  const Icon = style.icon;

  return (
    <div className="space-y-1">
      {episodes.map((ep) => {
        const isSelected = ep.id === selectedId;
        return (
          <button
            key={ep.id}
            onClick={() => onSelect(ep.id)}
            className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition cursor-pointer ${
              isSelected ? style.selected : style.unselected
            }`}
          >
            <div className="min-w-0 pr-2">
              <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? style.iconSelected : style.iconUnselected}`} />
                <span className="truncate">{ep.title}</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                {renderSubtitle ? renderSubtitle(ep) : ep.status}
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass(ep.status)}`} />
          </button>
        );
      })}
    </div>
  );
}
