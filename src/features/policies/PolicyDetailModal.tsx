'use client';

import type { ReactNode } from 'react';
import { Facts } from '@/components/data/ui';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/lib/format';
import type { Policy } from '@/types/policy';
import { POLICY_TYPE, validity } from './policyLabels';

/** "requiredLabelText" → "Required label text" */
const humanize = (key: string) =>
  key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

/** The structured content of a policy (JSON from the backend), as nested label / value lines; never as HTML. */
function ContentView({ value }: { value: unknown }): ReactNode {
  if (value === null || value === undefined || value === '') return <span className="text-muted-foreground">—</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {value.map((item, i) => (
          <li key={i}>
            <ContentView value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    return (
      <dl className="space-y-2">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-medium text-foreground">{humanize(k)}</dt>
            <dd className="mt-0.5 text-sm text-muted-foreground">
              <ContentView value={v} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  if (typeof value === 'boolean') return <>{value ? 'Có' : 'Không'}</>;
  return <span className="whitespace-pre-line">{String(value)}</span>;
}

export function PolicyDetailModal({ policy: p, onClose }: { policy: Policy; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl" title={p.name} subtitle={`Phiên bản ${p.version}`}>
      <div className="space-y-5">
        <Facts
          items={[
            ['Loại', POLICY_TYPE[p.type] ?? p.type],
            ['Trạng thái', p.isActive ? 'Đang áp dụng' : 'Ngừng áp dụng'],
            ['Hiệu lực', validity(p)],
            ['Tạo lúc', formatDateTime(p.createdAt)],
          ]}
        />
        {p.documentReference && (
          <section>
            <h3 className="text-sm font-medium">Văn bản pháp lý</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.documentReference}</p>
          </section>
        )}
        <section className="max-h-[45vh] overflow-y-auto rounded-lg border border-border p-4">
          <h3 className="mb-3 text-sm font-medium">Nội dung chi tiết</h3>
          <ContentView value={p.content} />
        </section>
      </div>
    </Modal>
  );
}
