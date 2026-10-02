'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/features/production/hooks/useAction';
import { PASSWORD_HINT, passwordValid } from '@/lib/registration';
import { adminService, type AccountRow } from '@/services/adminService';
import type { UserRole } from '@/types/production';
import { BACKEND_ROLE_LABEL, BACKEND_ROLES, STAFF_ROLES } from '../roles';

/**
 * Creates a staff account (members sign up themselves), or edits any account: name, email, role and,
 * optionally, a new password that signs it out everywhere.
 */
export function AccountFormModal({
  account,
  isMe,
  onClose,
  onSaved,
}: {
  /** null creates a new account. */
  account: AccountRow | null;
  isMe: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const creating = account === null;
  const [fullName, setFullName] = useState(account?.fullName ?? '');
  const [email, setEmail] = useState(account?.email ?? '');
  const [role, setRole] = useState<UserRole>(account?.role ?? 'CONTENT_CREATOR');
  const [password, setPassword] = useState('');
  const { busy, run } = useAction();

  const passwordOk = creating ? passwordValid(password) : !password || passwordValid(password);
  const valid = fullName.trim().length >= 2 && /\S+@\S+\.\S+/.test(email.trim()) && passwordOk;
  const roles = creating ? STAFF_ROLES : BACKEND_ROLES;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const done = creating
      ? await run(() => adminService.createAccount({ fullName: fullName.trim(), email: email.trim(), role, password }), 'Đã tạo tài khoản')
      : await run(
          () =>
            adminService.updateAccount(account.id, {
              ...(fullName.trim() !== account.fullName ? { fullName: fullName.trim() } : {}),
              ...(email.trim().toLowerCase() !== account.email ? { email: email.trim() } : {}),
              ...(!isMe && role !== account.role ? { role } : {}),
              ...(password ? { password } : {}),
            }),
          'Đã lưu tài khoản',
        );
    if (done) {
      await onSaved();
      onClose();
    }
  };

  return (
    <Modal open onClose={onClose} title={creating ? 'Tạo tài khoản' : 'Sửa tài khoản'} subtitle={creating ? 'Tài khoản nội bộ: Creator, Reviewer, Staff hoặc Admin.' : account.email}>
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Họ tên">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} minLength={2} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required className={fieldInputClass} />
        </FormField>
        <FormField label="Vai trò">
          <select value={role} disabled={isMe} onChange={(e) => setRole(e.target.value as UserRole)} className={fieldInputClass}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {BACKEND_ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={creating ? 'Mật khẩu ban đầu' : 'Mật khẩu mới (để trống nếu giữ nguyên)'}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" maxLength={72} required={creating} className={fieldInputClass} />
        </FormField>
        <p className={`text-[11px] ${passwordOk ? 'text-slate-500' : 'text-rose-600'}`}>
          {PASSWORD_HINT}
          {!creating && ' Đặt mật khẩu mới sẽ đăng xuất tài khoản khỏi mọi thiết bị.'}
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            {creating ? 'Tạo tài khoản' : 'Lưu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Deleting works only for an account with no activity; the backend explains otherwise and the Admin locks it. */
export function DeleteAccountModal({ account, onClose, onDeleted }: { account: AccountRow; onClose: () => void; onDeleted: () => Promise<void> }) {
  const { busy, run } = useAction();
  const remove = async () => {
    if (await run(() => adminService.deleteAccount(account.id), 'Đã xoá tài khoản')) {
      await onDeleted();
      onClose();
    }
  };
  return (
    <Modal open onClose={onClose} title="Xoá tài khoản" subtitle={`${account.fullName} · ${account.email}`}>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        Chỉ xoá được tài khoản chưa có hoạt động nào. Tài khoản đã tham gia dự án, kiểm duyệt hay giao dịch là một phần lịch sử: hãy khoá thay vì xoá.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
        <Button type="button" variant="danger" disabled={busy} onClick={remove}>
          Xoá tài khoản
        </Button>
      </div>
    </Modal>
  );
}
