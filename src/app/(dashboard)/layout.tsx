import { Be_Vietnam_Pro } from 'next/font/google';
import { DashboardHeader } from '@/features/production/components/shell/DashboardHeader';

// Drawn for Vietnamese: the stacked diacritics of the back office stay crisp at small sizes.
const beVietnam = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600', '700'], display: 'swap' });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Cinema Dark Theme: deep charcoal background and cinema red accents
    <div className={`${beVietnam.className} [--action:#E50914] [--action-strong:#B91C1C] min-h-screen bg-[#0A0D14] text-white flex flex-col transition-colors`}>
      <DashboardHeader />
      {children}
    </div>
  );
}
