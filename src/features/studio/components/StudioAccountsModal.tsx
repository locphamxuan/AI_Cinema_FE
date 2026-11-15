'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { studioService } from '@/services/studioService';
import type { Studio } from '@/types/production';
import { useAction } from '@/hooks/useAction';
import { useResource } from '@/hooks/useResource';
import { PASSWORD_HINT, passwordValid } from '@/lib/registration';
import { Empty, ErrorNote, Loading } from '@/components/data/ui';

const EMAIL = /^\S+@\S+\.\S+$/;

/**
 * MF-1 (07/11/2026): the Admin opens STUDIO login accounts for a partner studio. The studio signs in to Studio Web
 * with them to negotiate its contract and deliver its films; this back office refuses them.
 */
export function StudioAccountsModal({ studio, onClose }: { studio: Studio; onClose: () => void }) {
  const accounts = useResource(`studio-accounts:${studio.id}`, () => studioService.accounts(studio.id));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { busy, run } = useAction();
  const valid = fullName.trim().length >= 2 && EMAIL.test(email.trim()) && passwordValid(password);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await run(
      () => studioService.createAccount(studio.id, { fullName: fullName.trim(), email: email.trim().toLowerCase(), password }),
      'Đã tạo tài khoản Studio',
    );
    if (created) {
      setFullName('');
      setEmail('');
      setPassword('');
      await accounts.reload();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Tài khoản đăng nhập - ${studio.name}`}
      subtitle="Studio dùng các tài khoản này để đăng nhập Studio Web: ký hợp đồng và nộp phim từng tập."
      icon={<KeyRound className="w-4 h-4" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs">
        {accounts.error && <ErrorNote message={accounts.error} onRetry={accounts.reload} />}
        {accounts.loading && !accounts.data && <Loading />}
        {accounts.data && accounts.data.length === 0 && <Empty>Studio chưa có tài khoản đăng nhập.</Empty>}
        {accounts.data && accounts.data.length > 0 && (
          <ul className="divide-y divide-slate-100 dark:divide-white/5 rounded-xl border border-slate-200 dark:border-white/10" aria-label="Tài khoản của Studio">
            {accounts.data.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-800 dark:text-slate-100">{a.fullName}</span>
                  <span className="block truncate text-slate-500">{a.email}</span>
                </span>
                <Badge tone={a.isActive ? 'emerald' : 'neutral'}>{a.isActive ? 'Đang hoạt động' : 'Đã khoá'}</Badge>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={create} className="space-y-3 rounded-xl border border-slate-200 dark:border-white/10 p-3">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Tạo tài khoản mới</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Họ tên người phụ trách">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} minLength={2} maxLength={255} required className={fieldInputClass} />
            </FormField>
            <FormField label="Email đăng nhập">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required className={fieldInputClass} />
            </FormField>
          </div>
          <FormField label="Mật khẩu ban đầu" hint={PASSWORD_HINT}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required className={fieldInputClass} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" disabled={busy || !valid}>
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
