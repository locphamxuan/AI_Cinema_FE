'use client';

import { Clapperboard } from 'lucide-react';
import { MarqueeHero, MarqueeFigure } from '@/components/data/MarqueeHero';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  `${TAB} ${active ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`;

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
    <div className="min-h-screen w-full bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div role="tablist" aria-label="Khu quản trị" className="flex items-center gap-2 border-b border-border pb-3.5 text-xs">
          <button type="button" role="tab" aria-selected={tab === 'projects'} onClick={() => setTab('projects')} className={tabClass(tab === 'projects')}>
            Quản Trị Dự Án
          </button>
          <button type="button" role="tab" aria-selected={tab === 'charts'} onClick={() => setTab('charts')} className={tabClass(tab === 'charts')}>
            Biểu Đồ Doanh Thu & Vận Hành
          </button>
        </div>

        {tab === 'charts' ? (
          <AdminOverviewDashboard />
        ) : (
          <>
            <MarqueeHero
              title={`Chào ${user?.name ?? 'Quản trị viên'}`}
              subtitle={
                pipeline.data
                  ? `${pipeline.data.finalScripts.length} kịch bản chờ bạn duyệt Final, ${pipeline.data.contractsToSign.length} hợp đồng chờ ký, ${pipeline.data.readyFilms.length} phim chờ phát hành.`
                  : 'Đang tải việc của hôm nay…'
              }
              action={
                can(PERMISSION.PROJECT_CREATE) && (
                  <button type="button" onClick={() => setCreating(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-highlight px-6 text-sm font-semibold text-highlight-foreground shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 cursor-pointer">
                    <Clapperboard className="size-4" aria-hidden="true" />
                    Tạo dự án mới
                  </button>
                )
              }
            >
              {pipeline.data && (
                <>
                  <MarqueeFigure value={pipeline.data.totalProjects} label="Dự án trên nền tảng" />
                  <MarqueeFigure value={pipeline.data.producingProjects} label="Đang sản xuất" />
                  <MarqueeFigure value={pipeline.data.completedProjects} label="Đã hoàn tất" />
                </>
              )}
            </MarqueeHero>

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
