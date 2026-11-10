'use client';

import { useState } from 'react';
import { UserCog, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useAction } from '@/hooks/useAction';
import { PASSWORD_HINT, passwordValid } from '@/lib/registration';
import { adminService, type AccountRow } from '@/services/adminService';
import type { UserRole } from '@/types/production';
import { ASSIGNABLE_ROLES, BACKEND_ROLE_LABEL, ROLE_TONE, STAFF_ROLES } from '../roles';
import { Select } from '@/components/ui/Select';

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
  const roles = creating ? STAFF_ROLES : ASSIGNABLE_ROLES;
  // A STUDIO login keeps its role: it belongs to its studio (Studio đối tác → Tài khoản).
  const studioLogin = account?.role === 'STUDIO';

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
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-md"
      title={creating ? 'Tạo tài khoản' : 'Sửa tài khoản'}
      subtitle={creating ? 'Tài khoản nội bộ: Creator, Reviewer, Staff hoặc Admin.' : account.email}
      icon={creating ? <UserPlus className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Họ tên">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            minLength={2}
            maxLength={255}
            required
            placeholder="Ví dụ: Nguyễn Văn A"
            className={`${fieldInputClass} text-xs py-2 rounded-xl`}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
            placeholder="email@example.com"
            className={`${fieldInputClass} text-xs py-2 rounded-xl`}
          />
        </FormField>
        {studioLogin ? (
          <p className="text-xs text-slate-500">Vai trò: {BACKEND_ROLE_LABEL.STUDIO} - tài khoản Studio chỉ đăng nhập Studio Web, không đổi vai trò được.</p>
        ) : (
          <FormField label="Vai trò">
            <Select
              value={role}
              disabled={isMe}
              onChange={(val) => setRole(val as UserRole)}
              options={roles.map((r) => ({
                value: r,
                label: BACKEND_ROLE_LABEL[r],
                tone: ROLE_TONE[r],
              }))}
              size="md"
              aria-label="Vai trò"
              className="rounded-xl"
            />
          </FormField>
        )}
        <FormField label={creating ? 'Mật khẩu ban đầu' : 'Mật khẩu mới (để trống nếu giữ nguyên)'}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            maxLength={72}
            required={creating}
            placeholder={creating ? 'Tối thiểu 8 ký tự…' : 'Nhập mật khẩu mới nếu muốn đổi…'}
            className={`${fieldInputClass} text-xs py-2 rounded-xl`}
          />
        </FormField>
        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] p-3">
          <p className={`text-[11px] leading-relaxed ${passwordOk ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500 font-medium'}`}>
            💡 {PASSWORD_HINT}
            {!creating && ' Đặt mật khẩu mới sẽ đăng xuất tài khoản khỏi mọi thiết bị.'}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-full px-4 py-2 text-xs">
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={!valid || busy}
            className="rounded-full px-5 py-2 text-xs font-semibold bg-[#121212] hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs transition-colors"
          >
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
    <Modal
      open
      onClose={onClose}
      maxWidth="max-w-md"
      title="Xoá tài khoản"
      subtitle={`${account.fullName} · ${account.email}`}
      icon={<Trash2 className="w-5 h-5 text-rose-500" />}
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Chỉ xoá được tài khoản chưa có hoạt động nào. Tài khoản đã tham gia dự án, kiểm duyệt hay giao dịch là một phần lịch sử: hãy khoá thay vì xoá.
        </p>
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4 py-2 text-xs">
            Huỷ
          </Button>
          <Button type="button" variant="danger" disabled={busy} onClick={remove} className="rounded-xl px-4 py-2 text-xs font-semibold shadow-xs">
            Xoá tài khoản
          </Button>
        </div>
      </div>
    </Modal>
  );
}
