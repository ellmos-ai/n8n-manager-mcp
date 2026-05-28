export const es = {
    common: {
        error: (msg) => `Error: ${msg}`,
        success: (msg) => `Éxito: ${msg}`,
        serverStarted: 'Servidor MCP n8n Manager iniciado',
        notFound: (item) => `No encontrado: ${item}`,
    },
    server: {
        added: (name) => `Servidor añadido: ${name}`,
        removed: (name) => `Servidor eliminado: ${name}`,
        connected: (name) => `Conectado a: ${name}`,
        unreachable: (name) => `Servidor no disponible: ${name}`,
        noServers: 'No hay servidores configurados',
    },
    workflow: {
        listed: (count) => `Se encontraron ${count} flujo(s) de trabajo`,
        created: (name) => `Flujo de trabajo creado: ${name}`,
        updated: (name) => `Flujo de trabajo actualizado: ${name}`,
        deleted: (name) => `Flujo de trabajo eliminado: ${name}`,
        activated: (name) => `Flujo de trabajo activado: ${name}`,
        deactivated: (name) => `Flujo de trabajo desactivado: ${name}`,
        exported: (name) => `Flujo de trabajo exportado: ${name}`,
        imported: (name) => `Flujo de trabajo importado: ${name}`,
        notFound: (id) => `Flujo de trabajo no encontrado: ${id}`,
    },
    execution: {
        listed: (count) => `Se encontraron ${count} ejecución(es)`,
        noExecutions: 'No se encontraron ejecuciones',
    },
};
//# sourceMappingURL=es.js.map