import userEvent from '@testing-library/user-event';
import { within } from '@testing-library/react';

/** A signed contract the Admin attaches: a small PDF, or any file with the given type and size. */
export function pdfFile(name = 'hop-dong-da-ky.pdf', type = 'application/pdf', size = 1024): File {
  const file = new File(['%PDF-1.7'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

/** Picks `file` in the PDF field whose label matches `label` inside `scope`. */
export async function attachPdf(scope: HTMLElement, label: RegExp = /PDF/, file: File = pdfFile()) {
  await userEvent.upload(within(scope).getByLabelText(label), file);
  return file;
}

/** The multipart body a contract call sent. */
export const formOf = (body: unknown) => body as FormData;
