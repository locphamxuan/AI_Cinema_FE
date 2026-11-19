'use client';

import { Plus } from 'lucide-react';
import { GreetingCard } from '@/components/data/GreetingCard';
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
            Quản trị dự án
          </button>
          <button type="button" role="tab" aria-selected={tab === 'charts'} onClick={() => setTab('charts')} className={tabClass(tab === 'charts')}>
            Biểu đồ doanh thu & vận hành
          </button>
        </div>

        {tab === 'charts' ? (
          <AdminOverviewDashboard />
        ) : (
          <>
            <GreetingCard
              label="Hồ sơ quản trị viên"
              name={user?.name ?? 'Quản trị viên'}
              summary={
                pipeline.data
                  ? `${pipeline.data.finalScripts.length} kịch bản chờ duyệt Final, ${pipeline.data.contractsToSign.length} hợp đồng chờ ký, ${pipeline.data.readyFilms.length} phim chờ phát hành.`
                  : user?.email
              }
              figures={
                pipeline.data
                  ? [
                      { label: 'Dự án trên nền tảng', value: pipeline.data.totalProjects },
                      { label: 'Đang sản xuất', value: pipeline.data.producingProjects },
                      { label: 'Đã hoàn tất', value: pipeline.data.completedProjects },
                    ]
                  : undefined
              }
              action={
                can(PERMISSION.PROJECT_CREATE) && (
                  <button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary/90 cursor-pointer">
                    <Plus className="size-4" aria-hidden="true" />
                    Tạo dự án mới
                  </button>
                )
              }
            />

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
