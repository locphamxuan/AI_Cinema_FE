import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * jsdom decodes no image: this fake Image reports the given pixel size once its src is set, as a browser would
 * after loading the signature the Admin picked.
 */
export function stubImageDecoding(size = { width: 600, height: 200 }) {
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = 0;
      naturalHeight = 0;
      onload: (() => void) | null = null;
      set src(_url: string) {
        this.naturalWidth = size.width;
        this.naturalHeight = size.height;
        setTimeout(() => this.onload?.());
      }
    },
  );
  URL.createObjectURL = vi.fn(() => 'blob:chu-ky');
  URL.revokeObjectURL = vi.fn();
}

/** A signature image the Admin signs with, or any file with the given type and size. */
export function signatureFile(name = 'chu-ky.png', type = 'image/png', size = 1024): File {
  const file = new File(['png'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/**
 * Picks `file` in the signature field whose label matches `label` inside `scope`; a valid image is awaited until
 * its preview shows, which is when the form may sign with it.
 */
export async function attachSignature(scope: HTMLElement, label: RegExp = /Ảnh chữ ký/, file: File = signatureFile(), valid = true) {
  stubImageDecoding();
  await userEvent.upload(within(scope).getByLabelText(label), file, { applyAccept: false });
  if (valid) await within(scope).findByRole('img', { name: 'Xem trước chữ ký' });
  return file;
}

/** The multipart body a contract call sent. */
export const formOf = (body: unknown) => body as FormData;
