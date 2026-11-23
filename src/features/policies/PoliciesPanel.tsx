'use client';

import { useEffect, useState } from 'react';
import { MetaPager } from '@/components/data/MetaPager';
import { ConfirmModal } from '@/components/data/ConfirmModal';
import { Empty, ErrorNote, Loading, Panel, StatusPill } from '@/components/data/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn/table';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useResource } from '@/hooks/useResource';
import { useAction } from '@/hooks/useAction';
import { formatDay } from '@/lib/format';
import { policyService, type PolicyFilters } from '@/services/policyService';
import type { Policy, PolicyType } from '@/types/policy';
import { POLICY_TYPE_KEYS, POLICY_TYPES, policyState, policyTypeLabel } from './policyLabels';
import { PolicyDetailModal } from './PolicyDetailModal';
import { PolicyFormModal } from './PolicyFormModal';

const FILTER = `${fieldInputClass} py-1.5`;
const PAGE_SIZE = 20;

type Pending = { kind: 'toggle' | 'delete'; policy: Policy };

/**
 * Admin "Chính sách": the rules a Content Reviewer must follow when labelling an episode and checking its legal
 * compliance (BR-40, BR-42). Labelling and the compliance check record the newest policy of each type in force.
 */
export function PoliciesPanel() {
  const [filters, setFilters] = useState<PolicyFilters>({});
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Policy | null>(null);
  // null = closed, 'new' = create form, a policy = edit form.
  const [editing, setEditing] = useState<Policy | 'new' | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const { busy, run } = useAction();
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

  const confirm = async () => {
    if (!pending) return;
    const { kind, policy: p } = pending;
    const done =
      kind === 'delete'
        ? await run(() => policyService.remove(p.id), 'Đã xoá chính sách')
        : await run(() => policyService.update(p.id, { isActive: !p.isActive }), p.isActive ? 'Đã tắt chính sách' : 'Đã bật chính sách');
    setPending(null);
    if (done) await list.reload();
  };

  return (
    <Panel
      title="Chính sách"
      description="Các quy định mà Reviewer phải tuân theo khi gắn nhãn AI và kiểm tra pháp lý của từng tập phim. Reviewer thấy các chính sách đang áp dụng ngay cạnh phần kiểm tra tuân thủ."
      actions={
        <Button size="sm" onClick={() => setEditing('new')}>
          Thêm chính sách
        </Button>
      }
    >
      <ul className="mb-5 grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
        {POLICY_TYPE_KEYS.map((type) => (
          <li key={type} className="rounded-lg border border-border p-3">
            <p className="text-sm font-medium">{POLICY_TYPES[type].label}</p>
            <p className="mt-1 text-muted-foreground">{POLICY_TYPES[type].purpose}</p>
            <p className="mt-1 text-muted-foreground">{POLICY_TYPES[type].usedFor}</p>
          </li>
        ))}
      </ul>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tìm theo tiêu đề, nội dung hoặc căn cứ pháp lý"
          aria-label="Tìm chính sách"
          className={FILTER}
        />
        <select
          aria-label="Lọc theo loại"
          value={filters.type ?? ''}
          onChange={(e) => set({ type: (e.target.value || undefined) as PolicyType | undefined })}
          className={FILTER}
        >
          <option value="">Mọi loại</option>
          {POLICY_TYPE_KEYS.map((t) => (
            <option key={t} value={t}>
              {POLICY_TYPES[t].label}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo trạng thái"
          value={filters.active === undefined ? '' : String(filters.active)}
          onChange={(e) => set({ active: e.target.value === '' ? undefined : e.target.value === 'true' })}
          className={FILTER}
        >
          <option value="">Mọi trạng thái</option>
          <option value="true">Đang bật</option>
          <option value="false">Tắt</option>
        </select>
      </div>

      {list.error && <ErrorNote message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data && <Loading />}
      {list.data?.data.length === 0 && <Empty>Không có chính sách nào theo bộ lọc này.</Empty>}
      {list.data && list.data.data.length > 0 && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-96 whitespace-normal">
                    <button type="button" onClick={() => setOpen(p)} className="text-left font-medium hover:underline">
                      {p.name}
                    </button>
                    {p.documentReference && <p className="truncate text-xs text-muted-foreground">{p.documentReference}</p>}
                  </TableCell>
                  <TableCell>{policyTypeLabel(p.type)}</TableCell>
                  <TableCell>
                    <StatusPill {...policyState(p)} />
                  </TableCell>
                  <TableCell className="tabular-nums">{formatDay(p.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setPending({ kind: 'toggle', policy: p })}>
                        {p.isActive ? 'Tắt' : 'Bật'}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setPending({ kind: 'delete', policy: p })}>
                        Xoá
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <MetaPager meta={list.data.meta} onPage={setPage} />
        </div>
      )}

      {open && <PolicyDetailModal policy={open} onClose={() => setOpen(null)} />}
      {editing && <PolicyFormModal policy={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onDone={list.reload} />}
      <ConfirmModal
        open={pending !== null}
        tone={pending?.kind === 'delete' ? 'danger' : pending?.policy.isActive ? 'warning' : 'info'}
        title={
          pending?.kind === 'delete' ? 'Xoá chính sách' : pending?.policy.isActive ? 'Tắt chính sách' : 'Bật chính sách'
        }
        description={pending ? `"${pending.policy.name}" - ${policyTypeLabel(pending.policy.type)}` : ''}
        consequence={
          pending?.kind === 'delete'
            ? 'chính sách bị xoá hẳn. Chính sách đã được dùng khi gắn nhãn hoặc kiểm tra tuân thủ thì không xoá được, chỉ tắt được.'
            : pending?.policy.isActive
              ? 'Reviewer không còn thấy chính sách này khi kiểm tra. Mỗi loại phải còn ít nhất một chính sách đang áp dụng.'
              : 'Reviewer phải tuân theo chính sách này khi gắn nhãn và kiểm tra tuân thủ.'
        }
        confirmLabel={pending?.kind === 'delete' ? 'Xoá' : pending?.policy.isActive ? 'Tắt' : 'Bật'}
        busy={busy}
        onClose={() => setPending(null)}
        onConfirm={() => void confirm()}
      />
    </Panel>
  );
}
