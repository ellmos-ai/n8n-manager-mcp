import { afterEach, describe, expect, it } from "vitest";
import { getLanguage, getSupportedLanguages, setLanguage, t, type Lang } from "../src/i18n/index.js";

const localizedExpectations: Record<Exclude<Lang, "de" | "en">, {
  serverStarted: string;
  workflowCreated: string;
  noExecutions: string;
}> = {
  es: {
    serverStarted: "Servidor MCP n8n Manager iniciado",
    workflowCreated: "Flujo de trabajo creado: Demo",
    noExecutions: "No se encontraron ejecuciones",
  },
  zh: {
    serverStarted: "n8n Manager MCP 服务器已启动",
    workflowCreated: "已创建工作流: Demo",
    noExecutions: "未找到执行记录",
  },
  ja: {
    serverStarted: "n8n Manager MCPサーバーを起動しました",
    workflowCreated: "ワークフローを作成しました: Demo",
    noExecutions: "実行は見つかりませんでした",
  },
  ru: {
    serverStarted: "Сервер n8n Manager MCP запущен",
    workflowCreated: "Рабочий процесс создан: Demo",
    noExecutions: "Выполнения не найдены",
  },
};

describe("i18n language packs", () => {
  afterEach(() => {
    setLanguage("de");
  });

  it("exposes all supported language codes in stable order", () => {
    expect(getSupportedLanguages()).toEqual(["de", "en", "es", "zh", "ja", "ru"]);
  });

  it("defaults back to German after tests reset the language", () => {
    expect(getLanguage()).toBe("de");
    expect(t().common.serverStarted).toBe("n8n Manager MCP Server gestartet");
  });

  for (const [lang, expected] of Object.entries(localizedExpectations) as Array<[Exclude<Lang, "de" | "en">, typeof localizedExpectations.es]>) {
    it(`uses real ${lang} translations instead of English fallback`, () => {
      setLanguage(lang);

      expect(t().common.serverStarted).toBe(expected.serverStarted);
      expect(t().workflow.created("Demo")).toBe(expected.workflowCreated);
      expect(t().execution.noExecutions).toBe(expected.noExecutions);
      expect(t().common.serverStarted).not.toBe("n8n Manager MCP Server started");
    });
  }

  it("keeps placeholder interpolation intact across non-English languages", () => {
    setLanguage("zh");
    expect(t().workflow.listed(3)).toContain("3");

    setLanguage("ru");
    expect(t().server.connected("prod")).toContain("prod");

    setLanguage("es");
    expect(t().execution.listed(7)).toContain("7");
  });
});
