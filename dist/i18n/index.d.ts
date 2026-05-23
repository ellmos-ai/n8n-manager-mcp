import type { Translations } from './types.js';
type Lang = 'de' | 'en' | 'es' | 'zh' | 'ja' | 'ru';
export declare function t(): Translations;
export declare function setLanguage(lang: Lang): void;
export declare function getLanguage(): Lang;
export declare function getSupportedLanguages(): Lang[];
export type { Lang, Translations };
//# sourceMappingURL=index.d.ts.map