import { PageHeader } from '@/components/data/PageHeader';

/** One Admin page: an optional heading over the panels, which mostly carry their own. */
export function AdminPageFrame({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-6 py-6 lg:px-8">
      {title && <PageHeader title={title} description={description} />}
      {children}
    </main>
  );
}
