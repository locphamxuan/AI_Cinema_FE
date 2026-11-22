'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldInputClass } from '@/components/ui/FormField';
import { useAction } from '@/hooks/useAction';
import { productionService } from '@/services/productionService';
import type { ContractPartySettings, PlatformSettings } from '@/types/production';

type Field = keyof ContractPartySettings;

/** The lines of Bên A on every production contract, in the order the contract prints them. */
export const CONTRACT_PARTY_FIELDS: { key: Field; label: string; placeholder: string }[] = [
  { key: 'contractCompanyName', label: 'Tên công ty', placeholder: 'Công ty TNHH Nền tảng Phim AI Cinema' },
  { key: 'contractAddress', label: 'Địa chỉ trụ sở', placeholder: 'Số nhà, đường, phường, thành phố' },
  { key: 'contractTaxCode', label: 'Mã số thuế', placeholder: '0312345678' },
  { key: 'contractPhone', label: 'Điện thoại', placeholder: '028 0000 0001' },
  { key: 'contractEmail', label: 'Email', placeholder: 'legal@aicinema.vn' },
  { key: 'contractBankAccount', label: 'Tài khoản ngân hàng', placeholder: 'Số tài khoản - Ngân hàng, chi nhánh' },
  { key: 'contractRepresentative', label: 'Người đại diện ký', placeholder: 'Nguyễn Văn An' },
  { key: 'contractRepresentativeTitle', label: 'Chức vụ', placeholder: 'Giám đốc' },
  { key: 'contractPlace', label: 'Nơi ký và giải quyết tranh chấp', placeholder: 'Thành phố Hồ Chí Minh' },
];

/**
 * Bên A of the contract the system sends every studio once a Final Script is approved. Kept here instead of in
 * the code; a field left empty prints as a dotted line to fill in by hand.
 */
export function ContractPartySettingsForm({ current, onSaved }: { current: PlatformSettings; onSaved: () => Promise<void> }) {
  const [draft, setDraft] = useState<Partial<Record<Field, string>>>({});
  const { busy, run } = useAction();
  const value = (key: Field) => draft[key] ?? current[key] ?? '';
  const changed = CONTRACT_PARTY_FIELDS.filter(({ key }) => draft[key] !== undefined && draft[key] !== (current[key] ?? ''));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const patch = Object.fromEntries(changed.map(({ key }) => [key, value(key).trim()])) as Partial<PlatformSettings>;
    if (await run(() => productionService.updatePlatformSettings(patch), 'Đã lưu thông tin Bên A')) {
      setDraft({});
      await onSaved();
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 text-xs">
      <p className="rounded-2xl border border-border bg-muted/40 p-3 leading-relaxed text-muted-foreground">
        Thông tin này được in vào phần <strong>Bên A</strong> của hợp đồng mà hệ thống tự gửi cho Studio sau khi Admin duyệt
        Kịch bản bản cuối. Bên B lấy từ hồ sơ của từng Studio.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CONTRACT_PARTY_FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className={`space-y-1 ${key === 'contractAddress' || key === 'contractCompanyName' ? 'sm:col-span-2' : ''}`}>
            <span className="block font-semibold">{label}</span>
            <input
              value={value(key)}
              onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
              placeholder={placeholder}
              type={key === 'contractEmail' ? 'email' : 'text'}
              className={fieldInputClass}
            />
          </label>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        {changed.length > 0 && (
          <Button type="button" variant="secondary" onClick={() => setDraft({})}>
            Huỷ thay đổi
          </Button>
        )}
        <Button type="submit" disabled={busy || changed.length === 0}>
          {busy ? 'Đang lưu…' : `Lưu Bên A${changed.length ? ` (${changed.length})` : ''}`}
        </Button>
      </div>
    </form>
  );
}
