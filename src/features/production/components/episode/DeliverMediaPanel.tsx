'use client';

import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField, fieldInputClass, fieldTextareaClass } from '@/components/ui/FormField';
import type { ApiResponse } from '@/services/apiClient';
import { productionService } from '@/services/productionService';
import type { AiDisclosure, LabelType, MediaMetadataInput } from '@/types/production';
import { useAction } from '../../hooks/useAction';
import { AI_PARTS, LABEL_TYPE } from '../../lib/labels';
import { Panel } from '../shared/ui';

type Method = 'UPLOAD' | 'HLS_URL' | 'REMOTE_FILE';

/** One delivery as the form collects it: a file to upload, or a link, plus the AI Disclosure. */
export type Delivery =
  | { method: 'UPLOAD'; file: File; meta: MediaMetadataInput }
  | { method: 'HLS_URL' | 'REMOTE_FILE'; url: string; meta: MediaMetadataInput };

/** The Creator delivering what the studio sent, on its behalf. */
export function deliverAsCreator(episodeId: string) {
  return (d: Delivery) =>
    d.method === 'UPLOAD'
      ? productionService.uploadMedia(episodeId, d.file, d.meta)
      : productionService.submitMediaLink(episodeId, { ...d.meta, sourceMethod: d.method, sourceUrl: d.url });
}

const METHODS: { key: Method; label: string; hint: string }[] = [
  { key: 'UPLOAD', label: 'Tải file', hint: 'File video gốc; hệ thống chuyển sang HLS 360p/720p/1080p.' },
  { key: 'HLS_URL', label: 'Link HLS', hint: 'Studio tự host luồng .m3u8; hệ thống kiểm tra link định kỳ.' },
  { key: 'REMOTE_FILE', label: 'Link file', hint: 'Link tải trực tiếp file video; hệ thống tải về rồi chuyển mã.' },
];

/**
 * Steps 5–7: an episode delivery with the studio's AI Disclosure (BR-40, BR-41). The studio fills it in
 * its portal (`declarant="studio"`), or the Creator on the studio's behalf.
 */
export function DeliverMediaPanel({
  deliver,
  onDelivered,
  declarant = 'creator',
  title = 'Giao bản dựng của studio',
}: {
  deliver: (delivery: Delivery) => Promise<ApiResponse<unknown>>;
  onDelivered: () => Promise<void>;
  declarant?: 'studio' | 'creator';
  title?: string;
}) {
  const [method, setMethod] = useState<Method>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [labelType, setLabelType] = useState<LabelType>('AI_GENERATED');
  const [tools, setTools] = useState('');
  const [parts, setParts] = useState<string[]>(['video']);
  const [humanEdited, setHumanEdited] = useState(false);
  const [noLikeness, setNoLikeness] = useState(false);
  const [noCopyright, setNoCopyright] = useState(false);
  const [note, setNote] = useState('');
  const { busy, run } = useAction();

  const aiTools = tools
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const who = declarant === 'studio' ? 'Chúng tôi' : 'Studio';
  const sourceReady = method === 'UPLOAD' ? !!file : /^https?:\/\/\S+$/.test(url.trim());
  const valid = sourceReady && aiTools.length > 0 && parts.length > 0 && noLikeness && noCopyright;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const aiDisclosure: AiDisclosure = {
      aiTools,
      aiGeneratedParts: parts,
      humanEdited,
      noRealPersonLikeness: noLikeness,
      noCopyrightedMaterial: noCopyright,
    };
    const meta = { proposedLabelType: labelType, aiDisclosure, ...(note.trim() ? { submissionNote: note.trim() } : {}) };
    const delivery: Delivery = method === 'UPLOAD' ? { method, file: file!, meta } : { method, url: url.trim(), meta };
    const done = await run(() => deliver(delivery), 'Đã giao bản dựng, hệ thống đang xử lý');
    if (done) {
      setFile(null);
      setUrl('');
      setNote('');
      await onDelivered();
    }
  };

  return (
    <Panel title={title} description="Mỗi lần giao tạo một phiên bản mới; bản cũ được giữ lại.">
      <form onSubmit={submit} className="space-y-4 text-xs">
        <div role="radiogroup" aria-label="Cách giao" className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              aria-checked={method === m.key}
              onClick={() => setMethod(m.key)}
              className={`rounded-xl border px-3 py-2 font-semibold transition cursor-pointer ${
                method === m.key ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-slate-500 dark:text-slate-400">{METHODS.find((m) => m.key === method)?.hint}</p>

        {method === 'UPLOAD' ? (
          <FormField label="File video">
            <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-xs" />
          </FormField>
        ) : (
          <FormField label={method === 'HLS_URL' ? 'Link .m3u8' : 'Link file video'}>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className={fieldInputClass} />
          </FormField>
        )}

        <fieldset className="space-y-3 rounded-xl border border-slate-200 dark:border-white/10 p-3">
          <legend className="px-1 font-semibold text-slate-800 dark:text-slate-200">
            {declarant === 'studio' ? 'Khai báo và cam kết sử dụng AI của studio' : 'Khai báo AI của studio (Creator nhập thay)'}
          </legend>
          <FormField label="Công cụ AI đã dùng (cách nhau bằng dấu phẩy)">
            <input value={tools} onChange={(e) => setTools(e.target.value)} placeholder="Kling, ElevenLabs, Suno" className={fieldInputClass} />
          </FormField>
          <div>
            <span className="block text-slate-600 dark:text-slate-300 mb-1 font-medium">Phần do AI tạo</span>
            <div className="flex flex-wrap gap-3">
              {AI_PARTS.map((p) => (
                <label key={p.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parts.includes(p.value)}
                    onChange={(e) => setParts(e.target.checked ? [...parts, p.value] : parts.filter((v) => v !== p.value))}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={humanEdited} onChange={(e) => setHumanEdited(e.target.checked)} /> Có người chỉnh sửa thủ công
          </label>
          <label className="flex items-start gap-1.5 cursor-pointer">
            <input type="checkbox" className="mt-0.5" checked={noLikeness} onChange={(e) => setNoLikeness(e.target.checked)} />
            {who} cam kết không giả mạo gây hiểu nhầm người hoặc sự kiện có thật (BR-41)
          </label>
          <label className="flex items-start gap-1.5 cursor-pointer">
            <input type="checkbox" className="mt-0.5" checked={noCopyright} onChange={(e) => setNoCopyright(e.target.checked)} />
            {who} cam kết không dùng tài liệu có bản quyền của bên thứ ba (BR-41)
          </label>
        </fieldset>

        <FormField label="Nhãn AI đề xuất (Reviewer quyết định)">
          <select value={labelType} onChange={(e) => setLabelType(e.target.value as LabelType)} className={fieldInputClass}>
            {(Object.keys(LABEL_TYPE) as LabelType[]).map((t) => (
              <option key={t} value={t}>
                {LABEL_TYPE[t]}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Ghi chú cho AI Cinema (tuỳ chọn)">
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} className={fieldTextareaClass} />
        </FormField>

        <Button type="submit" className="w-full" disabled={!valid || busy}>
          <UploadCloud className="w-4 h-4" aria-hidden="true" /> {busy ? 'Đang gửi…' : 'Giao bản dựng'}
        </Button>
      </form>
    </Panel>
  );
}
