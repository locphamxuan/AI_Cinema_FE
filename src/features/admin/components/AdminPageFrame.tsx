/** One Admin page: an optional heading over the panels, which mostly carry their own. */
export function AdminPageFrame({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-6">
      {title && (
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </header>
      )}
      {children}
    </main>
  );
}
