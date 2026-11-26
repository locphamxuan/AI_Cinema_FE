'use client';

import { useEffect, useId, useState } from 'react';
import { signatureImageProblem, signatureSizeProblem } from '@/services/contractService';
import { formatBytes } from '@/lib/format';

/** Reads the pixel size of a chosen image in the browser; null when it cannot be decoded. */
function imageSize(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

/**
 * The signature image the Admin signs a contract with (MF-1, 22/11/2026): PNG or JPG, at most 2 MB, of a size
 * that prints legibly, checked and previewed here; the system draws it into the Bên A block of the contract.
 * `onChange` gets the file only once it passed every check.
 */
export function SignatureImageInput({ label, onChange }: { label: string; onChange: (file: File | null) => void }) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const choose = async (chosen: File | null) => {
    setFile(chosen);
    setPreview(null);
    onChange(null);
    const typeProblem = chosen ? signatureImageProblem(chosen) : null;
    setProblem(typeProblem);
    if (!chosen || typeProblem) return;
    const url = URL.createObjectURL(chosen);
    const size = await imageSize(url);
    const sizeProblem = size ? signatureSizeProblem(size.width, size.height) : 'Không đọc được ảnh, hãy chọn ảnh khác.';
    if (sizeProblem) {
      URL.revokeObjectURL(url);
      setProblem(sizeProblem);
      return;
    }
    setPreview(url);
    onChange(chosen);
  };

  return (
    <div className="space-y-1.5 text-xs">
      <label htmlFor={id} className="font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        onChange={(e) => void choose(e.target.files?.[0] ?? null)}
        className="block w-full text-xs text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground"
      />
      {problem ? (
        <p role="alert" className="text-destructive">
          {problem}
        </p>
      ) : preview && file ? (
        <figure className="rounded-lg border border-dashed border-border bg-white p-2 text-slate-700 dark:bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of the chosen file */}
          <img src={preview} alt="Xem trước chữ ký" className="mx-auto h-16 max-w-full object-contain" />
          <figcaption className="mt-1 border-t border-slate-300 pt-1 text-center">
            {file.name} ({formatBytes(file.size)})
          </figcaption>
        </figure>
      ) : (
        <p className="text-muted-foreground">
          Ảnh chữ ký (và con dấu nếu có) trên nền trắng, PNG hoặc JPG, tối đa 2 MB. Hệ thống đặt ảnh vào ô Bên A của hợp đồng kèm họ tên, chức vụ và ngày ký.
        </p>
      )}
    </div>
  );
}
