import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { ProjectMilestone } from '@/types/workflow';

type MilestoneStatus = ProjectMilestone['status'];

const MILESTONE_STATUS_CONFIG: Record<MilestoneStatus, { label: string; dot: string }> = {
  pending: {
    label: 'Chưa bắt đầu',
    dot: 'bg-slate-400 dark:bg-slate-500',
  },
  in_progress: {
    label: 'Đang làm',
    dot: 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]',
  },
  completed: {
    label: 'Hoàn thành',
    dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]',
  },
};

export interface MilestoneStatusDropdownProps {
  status: MilestoneStatus;
  onChange: (status: MilestoneStatus) => void;
}

export function MilestoneStatusDropdown({ status, onChange }: MilestoneStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentConfig = MILESTONE_STATUS_CONFIG[status] ?? MILESTONE_STATUS_CONFIG.pending;

  // A completed milestone cannot be reopened (the backend refuses it), so it is shown, not offered.
  if (status === 'completed') {
    return (
      <span className="h-9 px-3 text-xs font-semibold rounded-lg inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
        <span className={`w-2 h-2 rounded-full shrink-0 ${currentConfig.dot}`} aria-hidden="true" />
        {currentConfig.label}
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Đổi trạng thái cột mốc"
        className="h-9 px-3 text-xs font-semibold rounded-lg bg-white dark:bg-[#12141A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-xs hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${currentConfig.dot}`} aria-hidden="true" />
        <span>{currentConfig.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 w-44 p-1 rounded-xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-white/10 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {(Object.keys(MILESTONE_STATUS_CONFIG) as MilestoneStatus[]).map((key) => {
            const isSelected = key === status;
            const config = MILESTONE_STATUS_CONFIG[key];
            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
                  <span className="truncate">{config.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 ml-1.5" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
