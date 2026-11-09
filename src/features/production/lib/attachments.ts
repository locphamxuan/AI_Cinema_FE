/** Formats the backend takes for idea and synopsis files: documents, text, images and video (≤ 100 MB each). */
export const ATTACHMENT_ACCEPT = [
  '.pdf', '.doc', '.docx', '.rtf', '.txt', '.xlsx', '.pptx',
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif',
  '.mp4', '.m4v', '.mov', '.webm', '.mkv', '.avi',
].join(',');

export const ATTACHMENT_HINT = 'Word, PDF, TXT, Excel, PowerPoint, ảnh hoặc video - tối đa 100 MB mỗi tệp.';
