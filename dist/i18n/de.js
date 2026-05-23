export const de = {
    common: {
        error: (msg) => `Fehler: ${msg}`,
        success: (msg) => `Erfolgreich: ${msg}`,
        serverStarted: 'n8n Manager MCP Server gestartet',
        notFound: (item) => `Nicht gefunden: ${item}`,
    },
    server: {
        added: (name) => `Server hinzugefügt: ${name}`,
        removed: (name) => `Server entfernt: ${name}`,
        connected: (name) => `Verbunden mit: ${name}`,
        unreachable: (name) => `Server nicht erreichbar: ${name}`,
        noServers: 'Keine Server konfiguriert',
    },
    workflow: {
        listed: (count) => `${count} Workflow(s) gefunden`,
        created: (name) => `Workflow erstellt: ${name}`,
        updated: (name) => `Workflow aktualisiert: ${name}`,
        deleted: (name) => `Workflow gelöscht: ${name}`,
        activated: (name) => `Workflow aktiviert: ${name}`,
        deactivated: (name) => `Workflow deaktiviert: ${name}`,
        exported: (name) => `Workflow exportiert: ${name}`,
        imported: (name) => `Workflow importiert: ${name}`,
        notFound: (id) => `Workflow nicht gefunden: ${id}`,
    },
    execution: {
        listed: (count) => `${count} Ausführung(en) gefunden`,
        noExecutions: 'Keine Ausführungen vorhanden',
    },
};
//# sourceMappingURL=de.js.map