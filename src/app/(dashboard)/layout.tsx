import { Be_Vietnam_Pro } from 'next/font/google';
import { DashboardHeader } from '@/features/production/components/shell/DashboardHeader';

// Drawn for Vietnamese: the stacked diacritics of the back office stay crisp at small sizes.
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'], display: 'swap' });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // The back office acts in sky: buttons, focus rings and selections shared with the member site follow it.
    <div className={`${beVietnam.className} [--action:#0284C7] [--action-strong:#0369A1] min-h-screen bg-[#F3F9FC] dark:bg-[#0B1620] text-slate-900 dark:text-white flex flex-col transition-colors`}>
      <DashboardHeader />
      {children}
    </div>
  );
}
