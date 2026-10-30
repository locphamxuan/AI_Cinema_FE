'use client';

import { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Clapperboard, Film, CheckCircle2 } from 'lucide-react';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { StatCard } from '@/components/data/StatCard';
import { Card } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import type { ProjectSummary } from '@/types/production';

interface CreatorAnalyticsSectionProps {
  projects: ProjectSummary[];
  roleTitle?: string;
}

export function CreatorAnalyticsSection({ projects, roleTitle = 'Creator' }: CreatorAnalyticsSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Status breakdown
  const statusCounts = {
    plan: projects.filter((p) => p.status === 'DRAFT' || p.status === 'ASSIGNED').length,
    production: projects.filter((p) => p.status === 'IN_PRODUCTION' || p.status === 'UNDER_REVISION').length,
    done: projects.filter((p) => p.status === 'COMPLETED').length,
    cancelled: projects.filter((p) => p.status === 'CANCELLED').length,
  };

  const donutData = [
    { label: 'Đang sản xuất', value: statusCounts.production, color: 'var(--chart-1)' },
    { label: 'Hoàn tất', value: statusCounts.done, color: 'var(--chart-3)' },
    { label: 'Lên kế hoạch', value: statusCounts.plan, color: 'var(--chart-2)' },
    { label: 'Đã huỷ', value: statusCounts.cancelled, color: 'var(--chart-4)' },
  ];

  // Real-time active projects with episode counts (Top 6)
  const recentProjects = [...projects]
    .filter((p) => (p._count?.episodes ?? 0) > 0 || p.status === 'IN_PRODUCTION')
    .slice(0, 6);

  // Use real project titles (shortened if needed) for real-time fidelity
  const barCategories = recentProjects.map((p, idx) => {
    const title = p.title?.trim();
    if (title && title.length > 0) {
      return title.length > 15 ? `${title.slice(0, 13)}…` : title;
    }
    return `Dự án ${idx + 1}`;
  });

  const barSeries = [
    {
      name: 'Số tập',
      color: 'var(--chart-3)',
      values: recentProjects.map((p) => p._count?.episodes ?? 0),
    },
  ];

  const totalEpisodes = projects.reduce((acc, p) => acc + (p._count?.episodes ?? 0), 0);

  return (
    <Card className="mb-6 gap-0 py-0">
      <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
            <BarChart3 className="size-4 text-primary" aria-hidden="true" />
            Thống kê sản xuất
          </h2>
          <p className="text-sm text-muted-foreground">Trạng thái dự án và số tập đã làm của {roleTitle}.</p>
        </div>
        <Button variant="ghost" size="sm" aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? 'Mở biểu đồ' : 'Thu gọn'}
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>

      {!collapsed && (
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              featured
              icon={<Film />}
              label="Tổng số dự án"
              value={projects.length}
              note={`${statusCounts.production} đang sản xuất`}
            />
            <StatCard
              icon={<Clapperboard />}
              label="Tập đã có"
              value={totalEpisodes}
              unit="tập"
              note="Trên mọi dự án"
            />
            <StatCard
              icon={<CheckCircle2 />}
              label="Dự án đã hoàn tất"
              value={statusCounts.done}
              note={`${statusCounts.plan} đang lên kế hoạch`}
              noteTone="good"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border p-5">
              <h3 className="mb-4 text-sm font-semibold">Phân bổ trạng thái dự án</h3>
              <DonutChart
                data={donutData}
                centerLabel="dự án"
                centerValue={projects.length}
                valueUnit="phim"
                size={180}
              />
            </section>
            <section className="rounded-xl border p-5">
              <h3 className="mb-4 text-sm font-semibold">Số tập theo dự án</h3>
              <BarChart categories={barCategories} series={barSeries} valueUnit="tập" height={200} />
            </section>
          </div>
        </div>
      )}
    </Card>
  );
}
