'use client';

import type { ProjectScript } from '@/types/production';
import { formatDateTime } from '@/lib/format';
import { Empty, Panel } from '@/components/data/ui';
import { SCRIPT_STAGE } from '../../lib/labels';

/** Every version the Creator submitted (newest first, the newest open) and every review the Reviewer and Admin gave. */
export function ScriptHistory({ script }: { script: ProjectScript | null }) {
  if (!script) {
    return (
      <Panel title="Phiên bản & góp ý">
        <Empty>Chưa có phiên bản nào.</Empty>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <Panel title="Góp ý của Reviewer và Admin">
        {script.reviews.length === 0 ? (
          <Empty>Chưa có góp ý.</Empty>
        ) : (
          <ul className="space-y-2" aria-label="Góp ý kịch bản">
            {script.reviews.map((r) => (
              <li key={r.id} className="rounded-lg bg-slate-50 dark:bg-white/5 p-2.5 text-xs space-y-1">
                <p className={r.approved ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600'}>
                  {SCRIPT_STAGE[r.stage]} {r.approved ? 'đã duyệt' : 'yêu cầu sửa'} bản {r.version}
                </p>
                {r.comment && <p className="whitespace-pre-line text-slate-700 dark:text-slate-200">{r.comment}</p>}
                <p className="text-slate-500">
                  {r.reviewer.fullName} · {formatDateTime(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Các phiên bản">
        <ul className="space-y-2" aria-label="Phiên bản kịch bản">
          {script.versions.map((v, i) => (
            <li key={v.id}>
              <details open={i === 0} className="rounded-lg border border-slate-200 dark:border-white/10 p-2.5 text-xs">
                <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-100">
                  Bản {v.version} · {v.submittedBy.fullName} · {formatDateTime(v.createdAt)}
                </summary>
                {v.note && <p className="mt-2 text-slate-600 dark:text-slate-300">Thay đổi: {v.note}</p>}
                <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 dark:bg-white/5 p-2.5 font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-200">
                  {v.content}
                </pre>
              </details>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
