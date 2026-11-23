'use client';

import { Facts, StatusPill } from '@/components/data/ui';
import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/lib/format';
import type { Policy } from '@/types/policy';
import { POLICY_TYPES, policyState, validity } from './policyLabels';
import { PolicyText } from './PolicyText';

export function PolicyDetailModal({ policy: p, onClose }: { policy: Policy; onClose: () => void }) {
  const type = POLICY_TYPES[p.type];
  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl" title={p.name} subtitle={`Phiên bản ${p.version}`}>
      <div className="space-y-5">
        <Facts
          items={[
            ['Loại', type?.label ?? p.type],
            ['Trạng thái', <StatusPill key="s" {...policyState(p)} />],
            ['Thời gian áp dụng', validity(p)],
            ['Cập nhật', formatDateTime(p.updatedAt)],
            ...(p.documentReference ? [['Căn cứ pháp lý', p.documentReference] as [string, string]] : []),
          ]}
        />
        {type && <p className="text-xs text-muted-foreground">{type.usedFor}</p>}
        <section className="max-h-[50vh] overflow-y-auto rounded-lg border border-border p-4">
          <h3 className="mb-2 text-sm font-medium">Nội dung</h3>
          <PolicyText text={p.content} />
        </section>
      </div>
    </Modal>
  );
}
