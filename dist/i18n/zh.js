export const zh = {
    common: {
        error: (msg) => `错误: ${msg}`,
        success: (msg) => `成功: ${msg}`,
        serverStarted: 'n8n Manager MCP 服务器已启动',
        notFound: (item) => `未找到: ${item}`,
    },
    server: {
        added: (name) => `已添加服务器: ${name}`,
        removed: (name) => `已移除服务器: ${name}`,
        connected: (name) => `已连接到: ${name}`,
        unreachable: (name) => `服务器不可达: ${name}`,
        noServers: '未配置服务器',
    },
    workflow: {
        listed: (count) => `找到 ${count} 个工作流`,
        created: (name) => `已创建工作流: ${name}`,
        updated: (name) => `已更新工作流: ${name}`,
        deleted: (name) => `已删除工作流: ${name}`,
        activated: (name) => `已激活工作流: ${name}`,
        deactivated: (name) => `已停用工作流: ${name}`,
        exported: (name) => `已导出工作流: ${name}`,
        imported: (name) => `已导入工作流: ${name}`,
        notFound: (id) => `未找到工作流: ${id}`,
    },
    execution: {
        listed: (count) => `找到 ${count} 次执行`,
        noExecutions: '未找到执行记录',
    },
};
//# sourceMappingURL=zh.js.map