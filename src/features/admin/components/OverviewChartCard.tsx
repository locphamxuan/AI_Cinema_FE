import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { cn } from '@/lib/utils';

interface OverviewChartCardProps {
  title: string;
  description: string;
  /** `className` is accepted for older callers and ignored: links share one colour. */
  link?: { href: string; label: string; className?: string };
  className?: string;
  children: ReactNode;
}

/** One chart tile of the admin overview: a titled card with an optional link to the full page. */
export function OverviewChartCard({ title, description, link, className, children }: OverviewChartCardProps) {
  return (
    <Card className={cn('gap-4', className)}>
      <CardHeader>
        <CardTitle className="font-heading text-base">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {link && (
          <CardAction>
            <Link href={link.href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              {link.label}
            </Link>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
