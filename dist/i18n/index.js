import { de } from './de.js';
import { en } from './en.js';
import { es } from './es.js';
import { zh } from './zh.js';
import { ja } from './ja.js';
import { ru } from './ru.js';
const SUPPORTED = ['de', 'en', 'es', 'zh', 'ja', 'ru'];
const langs = { de, en, es, zh, ja, ru };
let current = (SUPPORTED.includes(process.env.N8N_MCP_LANGUAGE)
    ? process.env.N8N_MCP_LANGUAGE : 'de');
export function t() { return langs[current]; }
export function setLanguage(lang) { current = lang; }
export function getLanguage() { return current; }
export function getSupportedLanguages() { return [...SUPPORTED]; }
//# sourceMappingURL=index.js.map