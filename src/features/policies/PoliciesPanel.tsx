'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { MetaPager } from '@/components/data/MetaPager';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/components/data/ui';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useResource } from '@/hooks/useResource';
import { policyService, type PolicyFilters } from '@/services/policyService';
import type { Policy, PolicyType } from '@/types/policy';
import { POLICY_TYPE, validity } from './policyLabels';
import { PolicyDetailModal } from './PolicyDetailModal';

const SELECT = `${fieldInputClass} py-1.5 text-xs`;
const PAGE_SIZE = 20;

/**
 * 21.7 the platform policies AI labels and compliance checks follow (e.g. Điều 44 Luật 134/2025/QH15), read only.
 * The Reviewer checks a delivery against them; which one is in force is decided in the backend data.
 */
export function PoliciesPanel() {
  const [filters, setFilters] = useState<PolicyFilters>({});
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Policy | null>(null);
  const list = useResource(`policies:${JSON.stringify(filters)}:${page}`, () => policyService.list(page, PAGE_SIZE, filters));

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.search === (text.trim() || undefined) ? f : { ...f, search: text.trim() || undefined }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [text]);

  const set = (patch: PolicyFilters) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  return (
    <Panel
      title="Chính sách"
      description="Các văn bản mà nhãn AI và kiểm tra tuân thủ của mỗi tập phải theo. Chỉ xem; chính sách đang hiệu lực được hệ thống tự chọn."
    >
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tìm theo tên hoặc văn bản pháp lý" aria-label="Tìm chính sách" className={`${SELECT} pl-8`} />
        </div>
        <select aria-label="Lọc theo loại" value={filters.type ?? ''} onChange={(e) => set({ type: (e.target.value || undefined) as PolicyType | undefined })} className={SELECT}>
          <option value="">Mọi loại</option>
          {(Object.keys(POLICY_TYPE) as PolicyType[]).map((t) => (
            <option key={t} value={t}>
              {POLICY_TYPE[t]}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo hiệu lực"
          value={filters.active === undefined ? '' : String(filters.active)}
          onChange={(e) => set({ active: e.target.value === '' ? undefined : e.target.value === 'true' })}
          className={SELECT}
        >
          <option value="">Mọi trạng thái</option>
          <option value="true">Đang áp dụng</option>
          <option value="false">Ngừng áp dụng</option>
        </select>
      </div>

      {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data && <Loading />}
      {list.data?.data.length === 0 && <Empty>Không có chính sách nào theo bộ lọc này.</Empty>}
      {list.data && list.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-medium">Chính sách</th>
                <th className="py-2 pr-3 font-medium">Loại</th>
                <th className="py-2 pr-3 font-medium">Phiên bản</th>
                <th className="py-2 pr-3 font-medium">Hiệu lực</th>
                <th className="py-2 pr-3 font-medium">Trạng thái</th>
                <th className="py-2 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.data.data.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-96 py-2.5 pr-3">
                    <p className="font-medium">{p.name}</p>
                    {p.documentReference && <p className="truncate text-muted-foreground" title={p.documentReference}>{p.documentReference}</p>}
                  </td>
                  <td className="py-2.5 pr-3">{POLICY_TYPE[p.type] ?? p.type}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{p.version}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{validity(p)}</td>
                  <td className="py-2.5 pr-3">
                    <StatusPill label={p.isActive ? 'Đang áp dụng' : 'Ngừng áp dụng'} tone={p.isActive ? 'emerald' : 'neutral'} />
                  </td>
                  <td className="py-2.5 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(p)}>
                      Xem nội dung
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {list.data && <MetaPager meta={list.data.meta} onPage={setPage} />}
      {open && <PolicyDetailModal policy={open} onClose={() => setOpen(null)} />}
    </Panel>
  );
}
