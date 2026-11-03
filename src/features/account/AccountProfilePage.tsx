'use client';

import { useState } from 'react';
import { KeyRound, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { ErrorNote, Facts, Loading, Panel } from '@/features/production/components/shared/ui';
import { useAction } from '@/features/production/hooks/useAction';
import { useResource } from '@/features/production/hooks/useResource';
import { formatDateTime } from '@/features/production/lib/format';
import { accountService, PHONE_PATTERN, type AccountDetails } from '@/services/accountService';
import { productionService } from '@/services/productionService';
import { useAppStore } from '@/store/useAppStore';
import type { AuthRole } from '@/types/auth';

const ROLE_LABEL: Record<AuthRole, string> = {
  MEMBER: 'Thành viên',
  CONTENT_CREATOR: 'Content Creator',
  CONTENT_REVIEWER: 'Content Reviewer',
  STAFF: 'Nhân viên',
  ADMIN: 'Quản trị viên',
};

/** PASSWORD_RULE of the backend: 8–72 characters with at least one letter and one digit. */
const passwordValid = (p: string) => p.length >= 8 && p.length <= 72 && /[A-Za-z]/.test(p) && /\d/.test(p);

/** The account page of internal roles: details, own edits and password. */
export function AccountProfilePage() {
  const account = useResource('account:me', accountService.get);
  const projects = useResource('account:projects', () => productionService.listProjects({ limit: 1 }));

  return (
    <main className="w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="border-b border-slate-200/60 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Hồ sơ tài khoản</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Thông tin cá nhân và bảo mật. Email và vai trò do Admin quản lý.</p>
      </div>
      {account.error && <ErrorNote message={account.error} onRetry={account.reload} />}
      {account.loading && !account.data && <Loading />}
      {account.data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel title="Tài khoản">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-full bg-sky-600 text-white text-lg font-bold flex items-center justify-center">
                {account.data.fullName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{account.data.fullName}</p>
                <p className="text-xs text-slate-500">{ROLE_LABEL[account.data.role]}</p>
              </div>
            </div>
            <Facts
              stacked
              items={[
                ['Email', account.data.email],
                ['Số điện thoại', account.data.phoneNumber ?? '-'],
                ['Ngày sinh', account.data.dateOfBirth ? account.data.dateOfBirth.slice(0, 10) : '-'],
                ['Trạng thái', account.data.isActive ? 'Đang hoạt động' : 'Đã khoá'],
                ['Tham gia', formatDateTime(account.data.createdAt)],
                ['Dự án phim', projects.data ? String(projects.data.meta.totalItems) : '-'],
              ]}
            />
          </Panel>
          <div className="lg:col-span-2 space-y-5">
            <EditDetails account={account.data} onSaved={account.reload} />
            <ChangePassword />
          </div>
        </div>
      )}
    </main>
  );
}

function EditDetails({ account, onSaved }: { account: AccountDetails; onSaved: () => Promise<void> }) {
  const [fullName, setFullName] = useState(account.fullName);
  const [phone, setPhone] = useState(account.phoneNumber ?? '');
  const [birthday, setBirthday] = useState(account.dateOfBirth?.slice(0, 10) ?? '');
  const { busy, run } = useAction();
  const today = new Date().toISOString().slice(0, 10);
  const issues = [
    fullName.trim().length < 2 ? 'họ tên ít nhất 2 ký tự' : null,
    phone.trim() && !PHONE_PATTERN.test(phone.trim()) ? 'số điện thoại 8–15 chữ số' : null,
    birthday && birthday > today ? 'ngày sinh không ở tương lai' : null,
  ].filter(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (issues.length) return;
    const saved = await run(
      () =>
        accountService.update({
          fullName: fullName.trim(),
          phoneNumber: phone.trim() || null,
          ...(birthday ? { dateOfBirth: birthday } : {}),
        }),
      'Đã lưu hồ sơ',
    );
    if (!saved) return;
    useAppStore.getState().restoreSession();
    await onSaved();
  };

  return (
    <Panel title="Thông tin cá nhân" description="Tên hiển thị cho Reviewer, Creator và Admin trong các dự án.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Họ và tên">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={255} className={fieldInputClass} />
          </FormField>
          <FormField label="Số điện thoại">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={20} placeholder="0912 345 678" className={fieldInputClass} />
          </FormField>
          <FormField label="Ngày sinh">
            <input type="date" max={today} value={birthday} onChange={(e) => setBirthday(e.target.value)} className={fieldInputClass} />
          </FormField>
        </div>
        {issues.length > 0 && <p className="text-xs text-amber-600">Cần sửa: {issues.join('; ')}.</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || issues.length > 0}>
            <Save className="w-3.5 h-3.5" aria-hidden="true" /> Lưu thay đổi
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const { busy, run } = useAction();
  const issues = [
    next && !passwordValid(next) ? 'mật khẩu mới 8–72 ký tự, có chữ và số' : null,
    confirm && confirm !== next ? 'nhập lại chưa khớp' : null,
    next && next === current ? 'mật khẩu mới phải khác mật khẩu cũ' : null,
  ].filter(Boolean);
  const ready = current && next && confirm && issues.length === 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    if (await run(() => accountService.changePassword(current, next), 'Đã đổi mật khẩu; các phiên đăng nhập khác đã bị đăng xuất')) {
      setCurrent('');
      setNext('');
      setConfirm('');
    }
  };

  return (
    <Panel title="Đổi mật khẩu" description="Sau khi đổi, mọi thiết bị khác sẽ phải đăng nhập lại.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormField label="Mật khẩu hiện tại">
            <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={fieldInputClass} />
          </FormField>
          <FormField label="Mật khẩu mới">
            <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={fieldInputClass} />
          </FormField>
          <FormField label="Nhập lại mật khẩu mới">
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={fieldInputClass} />
          </FormField>
        </div>
        {issues.length > 0 && <p className="text-xs text-amber-600">Cần sửa: {issues.join('; ')}.</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || !ready}>
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" /> Đổi mật khẩu
          </Button>
        </div>
      </form>
    </Panel>
  );
}
