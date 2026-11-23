'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Studio } from '@/types/production';

const FIELDS: { key: 'contactName' | 'address' | 'taxCode' | 'bankAccount' | 'bankName' | 'representativeTitle'; label: string }[] = [
  { key: 'contactName', label: 'Người đại diện (Admin nhập)' },
  { key: 'representativeTitle', label: 'Chức vụ người đại diện' },
  { key: 'address', label: 'Địa chỉ trụ sở' },
  { key: 'taxCode', label: 'Mã số thuế' },
  { key: 'bankAccount', label: 'Số tài khoản' },
  { key: 'bankName', label: 'Ngân hàng' },
];

/** Every field Bên B of a contract needs that is still empty; signing is blocked until there is none. */
export const missingLegalFields = (studio: Studio) => FIELDS.filter(({ key }) => !studio[key]?.trim());

/** The legal profile the studio filled in on Studio Web, read-only for the Admin. */
export function StudioLegalProfileModal({ studio, onClose }: { studio: Studio; onClose: () => void }) {
  const complete = missingLegalFields(studio).length === 0;
  return (
    <Modal open onClose={onClose} title={`Hồ sơ pháp lý: ${studio.name}`} subtitle="Studio tự điền trên Studio Web. Hợp đồng in thông tin này ở phần Bên B.">
      <div className="space-y-4 text-sm">
        <Badge tone={complete ? 'emerald' : 'amber'}>{complete ? 'Đủ để ký hợp đồng' : 'Còn thiếu, Studio chưa ký được'}</Badge>
        <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[max-content_1fr]">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground break-words">{studio[key]?.trim() || <span className="text-muted-foreground">Chưa điền</span>}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
