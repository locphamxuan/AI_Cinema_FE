'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Clapperboard, Plus } from 'lucide-react';
import { ErrorNote, Loading } from '@/components/data/ui';
import { useCan } from '@/hooks/useCan';
import { useResource } from '@/hooks/useResource';
import { PERMISSION } from '@/lib/permissions';
import { CreateProjectModal } from '@/features/production/components/list/CreateProjectModal';
import { useAppStore } from '@/store/useAppStore';
import { loadAdminPipeline, type ContractToSign } from '../adminPipeline';
import { AdminOverviewDashboard } from './AdminOverviewDashboard';
import { PortalContractQuickSign, PortalMetrics, PortalReadyFilms } from './AdminPortalSections';
import { SignContractModal } from './SignContractModal';

const TAB = 'inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all cursor-pointer';
const tabClass = (active: boolean) =>
  `${TAB} ${active ? 'bg-[#121212] text-white shadow-xs dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]'}`;

/** /admin: what the Admin must decide in MF-1 (Final Scripts, contracts, Final Films) and the platform charts. */
export function AdminExecutivePortal() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const can = useCan();
  const [tab, setTab] = useState<'projects' | 'charts'>('projects');
  const [creating, setCreating] = useState(false);
  const [signing, setSigning] = useState<ContractToSign | null>(null);
  const pipeline = useResource('admin-pipeline', loadAdminPipeline);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div role="tablist" aria-label="Khu quản trị" className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5 text-xs">
          <button type="button" role="tab" aria-selected={tab === 'projects'} onClick={() => setTab('projects')} className={tabClass(tab === 'projects')}>
            <Clapperboard className="w-3.5 h-3.5" /> Quản Trị Dự Án
          </button>
          <button type="button" role="tab" aria-selected={tab === 'charts'} onClick={() => setTab('charts')} className={tabClass(tab === 'charts')}>
            <BarChart3 className="w-3.5 h-3.5" /> Biểu Đồ Doanh Thu & Vận Hành
          </button>
        </div>

        {tab === 'charts' ? (
          <AdminOverviewDashboard />
        ) : (
          <>
            <section aria-label="Hồ sơ quản trị viên" className="rounded-3xl bg-white dark:bg-[#111420] border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#121212] dark:bg-white flex items-center justify-center font-bold text-xl text-white dark:text-slate-900 shrink-0 shadow-xs">
                  {user?.name.charAt(0).toUpperCase() ?? 'A'}
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{user?.name ?? 'Quản trị viên'}</h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
                </div>
              </div>
              {can(PERMISSION.PROJECT_CREATE) && (
                <button type="button" onClick={() => setCreating(true)} className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-all">
                  <Plus className="w-4 h-4" /> Khởi Tạo Dự Án Mới
                </button>
              )}
            </section>

            {pipeline.error && <ErrorNote message={pipeline.error} onRetry={pipeline.reload} />}
            {pipeline.loading && !pipeline.data && <Loading />}
            {pipeline.data && (
              <>
                <PortalMetrics data={pipeline.data} />
                <PortalContractQuickSign items={pipeline.data.contractsToSign} onOpen={setSigning} />
                <PortalReadyFilms films={pipeline.data.readyFilms} onPublished={pipeline.reload} />
              </>
            )}
          </>
        )}
      </div>

      {creating && <CreateProjectModal onClose={() => setCreating(false)} onCreated={(id) => router.push(`/admin/projects/${id}`)} />}
      {signing && <SignContractModal item={signing} onClose={() => setSigning(null)} onChanged={pipeline.reload} />}
    </div>
  );
}
