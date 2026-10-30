'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Pencil, Search, Trash2, Unlock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminService, type AccountPage, type AccountRow } from '@/services/adminService';
import { toast } from '@/components/ui/Toast';
import { fieldInputClass } from '@/components/ui/FormField';
import { useAppStore } from '@/store/useAppStore';
import { useCan } from '@/hooks/useCan';
import { PERMISSION } from '@/lib/permissions';
import type { UserRole } from '@/types/production';
import { BACKEND_ROLE_LABEL, BACKEND_ROLES, ROLE_TONE } from '../roles';
import { Select } from '@/components/ui/Select';
import { AccountFormModal, DeleteAccountModal } from './AccountFormModal';

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Mọi vai trò' },
  ...BACKEND_ROLES.map((r) => ({
    value: r,
    label: BACKEND_ROLE_LABEL[r],
    tone: ROLE_TONE[r],
  })),
];

const ROLE_OPTIONS = BACKEND_ROLES.map((r) => ({
  value: r,
  label: BACKEND_ROLE_LABEL[r],
  tone: ROLE_TONE[r],
}));

const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Every account: the Admin creates staff accounts, edits, locks or deletes them here. */
export function AccountsPanel() {
  const can = useCan();
  const canManage = can(PERMISSION.USER_MANAGE);
  const myId = useAppStore((state) => state.user?.id);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<AccountPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AccountRow | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AccountRow | null>(null);

  const load = useCallback(async () => {
    const res = await adminService.listAccounts({ page, search, role: role || undefined });
    if (res.success) {
      setResult(res.data);
      setError(null);
    } else {
      setError(res.message ?? 'Không tải được danh sách tài khoản.');
    }
  }, [page, search, role]);

  useEffect(() => {
    // Typing in the search box waits a moment before asking the server.
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  const update = async (account: AccountRow, dto: { role?: UserRole; isActive?: boolean }, done: string) => {
    setSavingId(account.id);
    const res = await adminService.updateAccount(account.id, dto);
    setSavingId(null);
    if (!res.success) {
      toast.error('Không lưu được thay đổi', res.message ?? 'Thử lại sau ít phút.');
      return;
    }
    setResult((prev) => prev && { ...prev, data: prev.data.map((a) => (a.id === account.id ? res.data : a)) });
    toast.success(done, `${account.fullName} · ${account.email}`);
  };

  const accounts = result?.data ?? [];
  const totalPages = result?.meta.totalPages ?? 1;

  return (
    <section className="bg-white dark:bg-card rounded-2xl border border-sky-100 dark:border-white/10 overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Quản lý Tài khoản</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {result ? `${result.meta.totalItems} tài khoản trong hệ thống` : 'Đang tải…'} · Đổi vai trò hoặc trạng thái có hiệu lực tức thì.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {canManage && (
            <Button size="sm" onClick={() => setEditing('new')} className="shadow-xs">
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" /> Tạo tài khoản
            </Button>
          )}
          <label className="relative">
            <span className="sr-only">Tìm theo tên hoặc email</span>
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm tên hoặc email…"
              className={`${fieldInputClass} pl-9 py-1.5 w-56 text-xs rounded-xl`}
            />
          </label>
          <Select
            aria-label="Lọc theo vai trò"
            value={role}
            onChange={(val) => {
              setRole(val as UserRole | '');
              setPage(1);
            }}
            options={ROLE_FILTER_OPTIONS}
            size="sm"
            className="w-44"
          />
        </div>
      </div>

      {error && <p className="p-5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
            <tr>
              <th scope="col" className="py-3 px-5 font-semibold">Tài khoản</th>
              <th scope="col" className="py-3 px-4 font-semibold">Vai trò</th>
              <th scope="col" className="py-3 px-4 font-semibold">Trạng thái</th>
              <th scope="col" className="py-3 px-4 font-semibold">Ngày tạo</th>
              <th scope="col" className="py-3 px-5 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {accounts.map((account) => {
              const isMe = account.id === myId;
              const locked = !canManage || isMe || savingId === account.id;
              return (
                <tr key={account.id} className={`hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors ${account.isActive ? '' : 'opacity-60'}`}>
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {account.fullName} {isMe && <span className="text-sky-700 dark:text-sky-500 font-medium text-[11px] ml-1">(bạn)</span>}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{account.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Select
                      aria-label={`Vai trò của ${account.fullName}`}
                      value={account.role}
                      disabled={locked}
                      onChange={(newRole) =>
                        void update(
                          account,
                          { role: newRole as UserRole },
                          `Đã đổi vai trò thành ${BACKEND_ROLE_LABEL[newRole as UserRole]}`
                        )
                      }
                      options={ROLE_OPTIONS}
                      size="sm"
                      className="w-44"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        account.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {account.isActive ? 'Đang hoạt động' : 'Đã khoá'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{dateFormat.format(new Date(account.createdAt))}</td>
                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    {canManage && (
                      <Button size="sm" variant="ghost" aria-label={`Sửa ${account.fullName}`} onClick={() => setEditing(account)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {canManage && !isMe && (
                      <Button size="sm" variant="ghost" aria-label={`Xoá ${account.fullName}`} onClick={() => setDeleting(account)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </Button>
                    )}
                    {canManage && !isMe && (
                      <button
                        type="button"
                        disabled={savingId === account.id}
                        onClick={() =>
                          void update(
                            account,
                            { isActive: !account.isActive },
                            account.isActive ? 'Đã khoá tài khoản' : 'Đã mở khoá tài khoản'
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
                      >
                        {account.isActive ? <Lock className="w-3 h-3" aria-hidden="true" /> : <Unlock className="w-3 h-3" aria-hidden="true" />}
                        {account.isActive ? 'Khoá' : 'Mở khoá'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {result && accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  Không có tài khoản nào khớp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <AccountFormModal
          account={editing === 'new' ? null : editing}
          isMe={editing !== 'new' && editing.id === myId}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
      {deleting && <DeleteAccountModal account={deleting} onClose={() => setDeleting(null)} onDeleted={load} />}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 dark:border-white/5 text-xs">
          <button
            type="button"
            aria-label="Trang trước"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-500 dark:text-slate-400">
            Trang {page}/{totalPages}
          </span>
          <button
            type="button"
            aria-label="Trang sau"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
