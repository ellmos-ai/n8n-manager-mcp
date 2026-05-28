import type { Translations } from './types.js';

export const ru: Translations = {
  common: {
    error: (msg) => `Ошибка: ${msg}`,
    success: (msg) => `Успешно: ${msg}`,
    serverStarted: 'Сервер n8n Manager MCP запущен',
    notFound: (item) => `Не найдено: ${item}`,
  },

  server: {
    added: (name) => `Сервер добавлен: ${name}`,
    removed: (name) => `Сервер удалён: ${name}`,
    connected: (name) => `Подключено к: ${name}`,
    unreachable: (name) => `Сервер недоступен: ${name}`,
    noServers: 'Серверы не настроены',
  },

  workflow: {
    listed: (count) => `Найдено рабочих процессов: ${count}`,
    created: (name) => `Рабочий процесс создан: ${name}`,
    updated: (name) => `Рабочий процесс обновлён: ${name}`,
    deleted: (name) => `Рабочий процесс удалён: ${name}`,
    activated: (name) => `Рабочий процесс активирован: ${name}`,
    deactivated: (name) => `Рабочий процесс деактивирован: ${name}`,
    exported: (name) => `Рабочий процесс экспортирован: ${name}`,
    imported: (name) => `Рабочий процесс импортирован: ${name}`,
    notFound: (id) => `Рабочий процесс не найден: ${id}`,
  },

  execution: {
    listed: (count) => `Найдено выполнений: ${count}`,
    noExecutions: 'Выполнения не найдены',
  },
};
