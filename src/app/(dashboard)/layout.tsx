import { Be_Vietnam_Pro } from 'next/font/google';
import { DashboardHeader } from '@/features/production/components/shell/DashboardHeader';

// Drawn for Vietnamese: the stacked diacritics of the back office stay crisp at small sizes.
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'], display: 'swap' });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Dual Light & Dark Mode: Slate-50 Linear/Apple/Vercel style in light mode, deep charcoal in dark mode.
    <div className={`${beVietnam.className} [--action:#4F46E5] dark:[--action:#E50914] min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D14] text-slate-900 dark:text-white flex flex-col transition-colors duration-200`}>
      <DashboardHeader />
      {children}
    </div>
  );
}
