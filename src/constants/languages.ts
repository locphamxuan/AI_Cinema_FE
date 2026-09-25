/** Subtitle languages a project can ship (BCP-47 codes the backend accepts). */
export const SUBTITLE_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
] as const;

export const DEFAULT_SUBTITLE_LANGUAGE = 'vi';

export function languageLabel(code: string): string {
  return SUBTITLE_LANGUAGES.find((language) => language.code === code)?.label ?? code;
}
