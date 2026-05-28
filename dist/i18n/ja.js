export const ja = {
    common: {
        error: (msg) => `エラー: ${msg}`,
        success: (msg) => `成功: ${msg}`,
        serverStarted: 'n8n Manager MCPサーバーを起動しました',
        notFound: (item) => `見つかりません: ${item}`,
    },
    server: {
        added: (name) => `サーバーを追加しました: ${name}`,
        removed: (name) => `サーバーを削除しました: ${name}`,
        connected: (name) => `接続しました: ${name}`,
        unreachable: (name) => `サーバーに到達できません: ${name}`,
        noServers: 'サーバーが設定されていません',
    },
    workflow: {
        listed: (count) => `ワークフローが${count}件見つかりました`,
        created: (name) => `ワークフローを作成しました: ${name}`,
        updated: (name) => `ワークフローを更新しました: ${name}`,
        deleted: (name) => `ワークフローを削除しました: ${name}`,
        activated: (name) => `ワークフローを有効化しました: ${name}`,
        deactivated: (name) => `ワークフローを無効化しました: ${name}`,
        exported: (name) => `ワークフローをエクスポートしました: ${name}`,
        imported: (name) => `ワークフローをインポートしました: ${name}`,
        notFound: (id) => `ワークフローが見つかりません: ${id}`,
    },
    execution: {
        listed: (count) => `実行が${count}件見つかりました`,
        noExecutions: '実行は見つかりませんでした',
    },
};
//# sourceMappingURL=ja.js.map