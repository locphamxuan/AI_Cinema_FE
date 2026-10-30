import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface OverviewChartCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link?: { href: string; label: string; className: string };
  className?: string;
  children: ReactNode;
}

/** One chart tile of the admin overview: a titled card with an optional link to the full page. */
export function OverviewChartCard({ icon, title, description, link, className = '', children }: OverviewChartCardProps) {
  return (
    <div
      className={`p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-card shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {icon}
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {link && (
          <Link href={link.href} className={`text-xs font-semibold hover:underline flex items-center gap-1 ${link.className}`}>
            {link.label} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
