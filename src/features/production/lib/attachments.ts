/** Formats the backend takes for idea and synopsis files: documents, text, images and video (≤ 100 MB each). */
export const ATTACHMENT_ACCEPT = [
  '.pdf', '.doc', '.docx', '.rtf', '.txt', '.xlsx', '.pptx',
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif',
  '.mp4', '.m4v', '.mov', '.webm', '.mkv', '.avi',
].join(',');

export const ATTACHMENT_MAX_BYTES = 100 * 1024 * 1024;

export const ATTACHMENT_HINT = 'Word, PDF, TXT, Excel, PowerPoint, ảnh hoặc video - tối đa 100 MB mỗi tệp.';

export const tooLarge = (files: File[]) => files.filter((f) => f.size > ATTACHMENT_MAX_BYTES).map((f) => f.name);