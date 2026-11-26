import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { cn } from '@/lib/utils';

interface OverviewChartCardProps {
  title: string;
  description: string;
  link?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}

/** One chart tile of the admin overview: a titled card with an optional link to the full page. */
export function OverviewChartCard({ title, description, link, className, children }: OverviewChartCardProps) {
  return (
    <Card className={cn('gap-4 shadow-xs', className)}>
      <CardHeader>
        <CardTitle className="font-display text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {link && (
          <CardAction>
            <Link href={link.href} className="text-sm font-medium text-reel underline-offset-4 hover:underline">
              {link.label}
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
